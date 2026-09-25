import type { Role } from '@/types/database';

export const ROLE_LABEL: Record<Role, string> = {
  encargado: 'Encargado de Faltas',
  encargado_clase: 'Encargado de clase',
  maestro: 'Maestro',
};

export const ROLE_TONE: Record<Role, 'warning' | 'success' | 'primary'> = {
  encargado: 'warning',
  encargado_clase: 'success',
  maestro: 'primary',
};

export const ROLE_ORDER: Role[] = ['encargado_clase', 'maestro', 'encargado'];
