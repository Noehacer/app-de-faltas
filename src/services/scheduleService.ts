import { supabase } from '@/lib/supabase';
import type { ScheduleSlot } from '@/types/database';

export type WeekAbsence = {
  occurred_on: string;
  class_period_id: string;
  students: { grade_group: string | null } | null;
};

export type SlotInput = Pick<ScheduleSlot, 'group_name' | 'weekday' | 'class_period_id' | 'subject_id' | 'teacher_id'>;

export const scheduleService = {
  async listGroups(): Promise<string[]> {
    const { data, error } = await supabase.from('students').select('grade_group').not('grade_group', 'is', null);
    if (error) throw error;
    const groups = new Set<string>();
    for (const row of data ?? []) {
      const name = (row as { grade_group: string | null }).grade_group?.trim();
      if (name) groups.add(name);
    }
    return [...groups].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  },

  async listSlots(group: string): Promise<ScheduleSlot[]> {
    const { data, error } = await supabase.from('schedule_slots').select('*').eq('group_name', group);
    if (error) throw error;
    return (data ?? []) as ScheduleSlot[];
  },

  async saveSlot(slot: SlotInput) {
    const { error } = await supabase
      .from('schedule_slots')
      .upsert(slot, { onConflict: 'group_name,weekday,class_period_id' });
    if (error) throw error;
  },

  async removeSlot(id: string) {
    const { error } = await supabase.from('schedule_slots').delete().eq('id', id);
    if (error) throw error;
  },

  async listWeekAbsences(from: string, to: string): Promise<WeekAbsence[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('occurred_on, class_period_id, students(grade_group)')
      .gte('occurred_on', from)
      .lte('occurred_on', to);
    if (error) throw error;
    return (data ?? []) as unknown as WeekAbsence[];
  },
};
