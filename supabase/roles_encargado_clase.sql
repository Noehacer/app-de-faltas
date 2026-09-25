-- Agrega el rol "encargado_clase" (reporta faltas, sin acceso a Catálogos ni Usuarios).
-- Ejecutar una sola vez en el SQL Editor de Supabase. Es seguro volver a correrlo.
-- El rol "encargado" (administrador) se muestra en la app como "Encargado de Faltas".

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles
  add constraint profiles_role_check
  check (role in ('encargado', 'encargado_clase', 'maestro'));

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
