-- Roles y cuentas: "encargado" administra, "maestro" solo registra faltas.
-- Ejecutar DESPUES de schema.sql, en el SQL Editor de Supabase.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('encargado', 'encargado_clase', 'maestro')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Funciones auxiliares (security definer para evitar recursión en las políticas)
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active);
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active and role = 'encargado');
$$;

-- El encargado registra el perfil de una cuenta recién creada
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
end;
$$;

grant execute on function public.admin_register_profile(uuid, text, text) to authenticated;

-- Políticas de profiles
drop policy if exists "profiles read" on profiles;
drop policy if exists "profiles update" on profiles;
create policy "profiles read" on profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles update" on profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Catálogos: leer = cualquier miembro activo; escribir = solo encargado
do $$
declare t text;
begin
  foreach t in array array['teachers','subjects','students','class_periods'] loop
    execute format('drop policy if exists "authenticated read" on %I', t);
    execute format('drop policy if exists "authenticated insert" on %I', t);
    execute format('drop policy if exists "authenticated update" on %I', t);
    execute format('drop policy if exists "authenticated delete" on %I', t);
    execute format('drop policy if exists "members read" on %I', t);
    execute format('drop policy if exists "admin insert" on %I', t);
    execute format('drop policy if exists "admin update" on %I', t);
    execute format('drop policy if exists "admin delete" on %I', t);
    execute format('create policy "members read" on %I for select to authenticated using (public.is_member())', t);
    execute format('create policy "admin insert" on %I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on %I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on %I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Faltas: miembros leen y registran; editar/borrar solo el encargado o quien la creó
drop policy if exists "authenticated read" on attendance_records;
drop policy if exists "authenticated insert" on attendance_records;
drop policy if exists "authenticated update" on attendance_records;
drop policy if exists "authenticated delete" on attendance_records;
drop policy if exists "members read" on attendance_records;
drop policy if exists "members insert" on attendance_records;
drop policy if exists "owner or admin update" on attendance_records;
drop policy if exists "owner or admin delete" on attendance_records;
create policy "members read" on attendance_records for select to authenticated using (public.is_member());
create policy "members insert" on attendance_records for insert to authenticated with check (public.is_member());
create policy "owner or admin update" on attendance_records for update to authenticated
  using (public.is_admin() or created_by = auth.uid()) with check (public.is_admin() or created_by = auth.uid());
create policy "owner or admin delete" on attendance_records for delete to authenticated
  using (public.is_admin() or created_by = auth.uid());

-- Evita que el cliente falsifique created_by: siempre se fija al usuario autenticado real.
create or replace function public.set_attendance_created_by() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_attendance_created_by on attendance_records;
create trigger trg_attendance_created_by
  before insert on attendance_records
  for each row execute function public.set_attendance_created_by();

-- Cuentas que ya existen: la más antigua pasa a ser encargado, las demás maestros.
insert into profiles (id, full_name, email, role)
select u.id,
       split_part(u.email, '@', 1),
       u.email,
       case when u.id = (select id from auth.users order by created_at limit 1)
            then 'encargado' else 'maestro' end
from auth.users u
on conflict (id) do nothing;
