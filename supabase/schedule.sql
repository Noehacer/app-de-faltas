-- Horario semanal por grupo (cuadrícula día x hora con materia y maestro).
-- Ejecutar una sola vez en el SQL Editor de Supabase. Es seguro volver a correrlo.
-- Requiere schema.sql y roles.sql ejecutados antes.

-- Turnos: cada hora/periodo pertenece a un turno (matutino o vespertino).
alter table class_periods add column if not exists shift text not null default 'matutino';
alter table class_periods drop constraint if exists class_periods_shift_check;
alter table class_periods
  add constraint class_periods_shift_check check (shift in ('matutino', 'vespertino'));

create table if not exists schedule_slots (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,                       -- ej. "3ro A" (igual que students.grade_group)
  weekday int not null check (weekday between 1 and 5),  -- 1 = lunes ... 5 = viernes
  class_period_id uuid not null references class_periods(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_name, weekday, class_period_id)
);

create index if not exists idx_schedule_group on schedule_slots (group_name);

alter table schedule_slots enable row level security;

drop policy if exists "members read" on schedule_slots;
drop policy if exists "admin insert" on schedule_slots;
drop policy if exists "admin update" on schedule_slots;
drop policy if exists "admin delete" on schedule_slots;

create policy "members read" on schedule_slots for select to authenticated using (public.is_member());
create policy "admin insert" on schedule_slots for insert to authenticated with check (public.is_admin());
create policy "admin update" on schedule_slots for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on schedule_slots for delete to authenticated using (public.is_admin());
