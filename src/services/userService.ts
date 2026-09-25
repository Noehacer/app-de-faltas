import { createEphemeralClient, supabase } from '@/lib/supabase';
import type { Profile, Role } from '@/types/database';

export type NewAccount = {
  full_name: string;
  email: string;
  password: string;
  role: Role;
};

export const userService = {
  async list(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true })
      .order('full_name');
    if (error) throw error;
    return (data ?? []) as Profile[];
  },

  // Se registra con un cliente temporal para no cerrar la sesión del encargado.
  async createAccount({ full_name, email, password, role }: NewAccount) {
    const temp = createEphemeralClient();
    const { data, error } = await temp.auth.signUp({ email, password });
    if (error) throw error;
    const userId = data.user?.id;
    if (!userId) throw new Error('No se pudo crear la cuenta.');
    if (data.user?.identities?.length === 0) throw new Error('Ese correo ya está registrado.');

    const { error: profileError } = await supabase.rpc('admin_register_profile', {
      p_user_id: userId,
      p_full_name: full_name,
      p_role: role,
    });
    if (profileError) throw profileError;
  },

  async setActive(id: string, active: boolean) {
    const { error } = await supabase.rpc('admin_set_active', { p_user_id: id, p_active: active });
    if (error) throw error;
  },
};
