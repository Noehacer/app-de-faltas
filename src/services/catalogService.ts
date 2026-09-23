import { supabase } from '@/lib/supabase';
import type { CatalogTable } from '@/types/database';

export const catalogService = {
  async list<T>(table: CatalogTable): Promise<T[]> {
    const orderColumn = table === 'class_periods' ? 'sort_order' : 'created_at';
    const { data, error } = await supabase.from(table).select('*').order(orderColumn);
    if (error) throw error;
    return (data ?? []) as T[];
  },

  async create<T extends Record<string, unknown>>(table: CatalogTable, values: T) {
    const { error } = await supabase.from(table).insert(values);
    if (error) throw error;
  },

  async remove(table: CatalogTable, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },
};
