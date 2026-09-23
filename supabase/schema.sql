-- Esquema de base de datos para "Control de Faltas"
-- Ejecutar este script completo en el SQL Editor del proyecto de Supabase.

create extension if not exists "pgcrypto";

create table teachers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  created_at timestamptz not null default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  grade_group text,
  created_at timestamptz not null default now()
);

create table class_periods (
  id uuid primary key default gen_random_uuid(),
  label text not null,                   -- ej. "1ra hora" o "07:00 - 07:50"
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null default current_date,
  class_period_id uuid not null references class_periods(id),
  subject_id uuid not null references subjects(id),
  teacher_id uuid not null references teachers(id),
  student_id uuid not null references students(id),
  reason text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create index idx_attendance_occurred_on on attendance_records (occurred_on desc);
create index idx_attendance_student on attendance_records (student_id);
create index idx_attendance_teacher on attendance_records (teacher_id);

-- Row Level Security: cualquier usuario autenticado puede leer/escribir todo (permisos planos, MVP)
alter table teachers enable row level security;
alter table subjects enable row level security;
alter table students enable row level security;
alter table class_periods enable row level security;
alter table attendance_records enable row level security;

create policy "authenticated read" on teachers for select to authenticated using (true);
create policy "authenticated insert" on teachers for insert to authenticated with check (true);
create policy "authenticated update" on teachers for update to authenticated using (true) with check (true);
create policy "authenticated delete" on teachers for delete to authenticated using (true);

create policy "authenticated read" on subjects for select to authenticated using (true);
create policy "authenticated insert" on subjects for insert to authenticated with check (true);
create policy "authenticated update" on subjects for update to authenticated using (true) with check (true);
create policy "authenticated delete" on subjects for delete to authenticated using (true);

create policy "authenticated read" on students for select to authenticated using (true);
create policy "authenticated insert" on students for insert to authenticated with check (true);
create policy "authenticated update" on students for update to authenticated using (true) with check (true);
create policy "authenticated delete" on students for delete to authenticated using (true);

create policy "authenticated read" on class_periods for select to authenticated using (true);
create policy "authenticated insert" on class_periods for insert to authenticated with check (true);
create policy "authenticated update" on class_periods for update to authenticated using (true) with check (true);
create policy "authenticated delete" on class_periods for delete to authenticated using (true);

create policy "authenticated read" on attendance_records for select to authenticated using (true);
create policy "authenticated insert" on attendance_records for insert to authenticated with check (true);
create policy "authenticated update" on attendance_records for update to authenticated using (true) with check (true);
create policy "authenticated delete" on attendance_records for delete to authenticated using (true);
