import { supabase } from '@/lib/supabase';
import type { AttendanceRecordWithRelations } from '@/types/database';

export type AttendanceDateFilter = 'today' | 'week' | 'all';

export type NewAttendanceRecord = {
  occurred_on: string;
  class_period_id: string;
  subject_id: string;
  teacher_id: string;
  student_id: string;
  reason: string | null;
};

function startOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  return monday.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const attendanceService = {
  async list(dateFilter: AttendanceDateFilter): Promise<AttendanceRecordWithRelations[]> {
    let query = supabase
      .from('attendance_records')
      .select(
        '*, students(full_name), teachers(full_name), subjects(name), class_periods(label)'
      )
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (dateFilter === 'today') {
      query = query.eq('occurred_on', todayIso());
    } else if (dateFilter === 'week') {
      query = query.gte('occurred_on', startOfWeekIso());
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as AttendanceRecordWithRelations[];
  },

  async create(record: NewAttendanceRecord) {
    const { error } = await supabase.from('attendance_records').insert(record);
    if (error) throw error;
  },
};
