export type Teacher = {
  id: string;
  full_name: string;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  created_at: string;
};

export type Student = {
  id: string;
  full_name: string;
  grade_group: string | null;
  created_at: string;
};

export type Shift = 'matutino' | 'vespertino';

export type ClassPeriod = {
  id: string;
  label: string;
  shift: Shift;
  sort_order: number;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  occurred_on: string;
  class_period_id: string;
  subject_id: string;
  teacher_id: string;
  student_id: string;
  reason: string | null;
  created_by: string;
  created_at: string;
};

export type AttendanceRecordWithRelations = AttendanceRecord & {
  students: Pick<Student, 'full_name'>;
  teachers: Pick<Teacher, 'full_name'>;
  subjects: Pick<Subject, 'name'>;
  class_periods: Pick<ClassPeriod, 'label'>;
};

export type Role = 'encargado' | 'encargado_clase' | 'maestro';

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  active: boolean;
  created_at: string;
};

export type CatalogTable = 'teachers' | 'subjects' | 'students' | 'class_periods';

export type ScheduleSlot = {
  id: string;
  group_name: string;
  weekday: number;
  class_period_id: string;
  subject_id: string;
  teacher_id: string;
  created_at: string;
};
