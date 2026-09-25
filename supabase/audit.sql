-- Auditoría: registro de acciones sensibles (cuentas) y trazabilidad de quién crea cada registro de catálogo.
-- Ejecutar una sola vez en el SQL Editor de Supabase, después de schedule.sql. Es seguro volver a correrlo.
-- Requiere schema.sql, roles.sql y schedule.sql ejecutados antes.

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table audit_log enable row level security;

drop policy if exists "admin read" on audit_log;
create policy "admin read" on audit_log for select to authenticated using (public.is_admin());
-- Sin política de insert/update/delete para clientes: solo se escribe desde funciones security definer.

create or replace function public.log_audit_event(p_action text, p_target_id uuid, p_metadata jsonb default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor_id, action, target_id, metadata)
  values (auth.uid(), p_action, p_target_id, p_metadata);
end;
$$;

-- created_by en catálogos y horario: trazabilidad de quién agregó cada registro.
alter table teachers add column if not exists created_by uuid references auth.users(id);
alter table subjects add column if not exists created_by uuid references auth.users(id);
alter table students add column if not exists created_by uuid references auth.users(id);
alter table class_periods add column if not exists created_by uuid references auth.users(id);
alter table schedule_slots add column if not exists created_by uuid references auth.users(id);

create or replace function public.set_created_by() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['teachers', 'subjects', 'students', 'class_periods', 'schedule_slots'] loop
    execute format('drop trigger if exists trg_set_created_by on %I', t);
    execute format('create trigger trg_set_created_by before insert on %I for each row execute function public.set_created_by()', t);
  end loop;
end $$;

-- admin_register_profile: deja rastro en audit_log de quién creó cada cuenta.
create or replace function public.admin_register_profile(
  p_user_id uuid, p_full_name text, p_role text
) returns void
language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  if not public.is_admin() then
    raise exception 'Solo un encargado puede crear cuentas';
  end if;
  if p_role not in ('encargado', 'encargado_clase', 'maestro') then
    raise exception 'Rol inválido';
  end if;
  select email into v_email from auth.users where id = p_user_id;
  if v_email is null then
    raise exception 'La cuenta no existe';
  end if;
  insert into profiles (id, full_name, email, role)
  values (p_user_id, p_full_name, v_email, p_role);

  perform public.log_audit_event('account_created', p_user_id, jsonb_build_object('full_name', p_full_name, 'role', p_role));
end;
$$;

grant execute on function public.admin_register_profile(uuid, text, text) to authenticated;

-- Activar/desactivar cuentas vía RPC (en vez de un update directo desde el cliente) para poder auditar quién lo hizo.
create or replace function public.admin_set_active(p_user_id uuid, p_active boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un encargado puede activar o desactivar cuentas';
  end if;
  update profiles set active = p_active where id = p_user_id;
  perform public.log_audit_event(
    case when p_active then 'account_activated' else 'account_deactivated' end,
    p_user_id,
    null
  );
end;
$$;

grant execute on function public.admin_set_active(uuid, boolean) to authenticated;
