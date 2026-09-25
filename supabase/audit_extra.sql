-- Auditoría ampliada. Ejecutar DESPUES de audit.sql, una sola vez en el SQL Editor de Supabase.
-- Es seguro volver a correrlo. Usa la misma tabla audit_log de audit.sql.
--
-- 1) Registra quién inserta, cambia o borra catálogos, horarios y faltas (lo hacen triggers,
--    así que también queda registrado si alguien llama la API directo).
-- 2) Impide que un encargado desactive su propia cuenta.
-- 3) Elimina el UPDATE directo sobre profiles: activar/desactivar solo por admin_set_active,
--    para que siempre quede rastro en audit_log.

create or replace function public.log_row_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb;
begin
  if tg_op = 'DELETE' then v_row := to_jsonb(old); else v_row := to_jsonb(new); end if;

  insert into audit_log (actor_id, action, target_id, metadata)
  values (
    auth.uid(),
    lower(tg_op) || '_' || tg_table_name,          -- ej. delete_teachers, update_attendance_records
    (v_row ->> 'id')::uuid,
    case when tg_op = 'UPDATE'
         then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
         else v_row end
  );
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'teachers', 'subjects', 'students', 'class_periods',
    'schedule_slots', 'attendance_records'
  ] loop
    execute format('drop trigger if exists audit_row_change on %I', t);
    execute format(
      'create trigger audit_row_change after insert or update or delete on %I
       for each row execute function public.log_row_change()', t);
  end loop;
end $$;

create or replace function public.admin_set_active(p_user_id uuid, p_active boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un encargado puede activar o desactivar cuentas';
  end if;
  if p_user_id = auth.uid() and not p_active then
    raise exception 'No puedes desactivar tu propia cuenta';
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

drop policy if exists "profiles update" on profiles;
