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

export type ClassPeriod = {
  id: string;
  label: string;
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

export type CatalogTable = 'teachers' | 'subjects' | 'students' | 'class_periods';
