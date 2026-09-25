import type { Shift } from '@/types/database';

export const SHIFTS: { value: Shift; label: string }[] = [
  { value: 'matutino', label: 'Matutino' },
  { value: 'vespertino', label: 'Vespertino' },
];

export const SHIFT_LABEL: Record<Shift, string> = {
  matutino: 'Matutino',
  vespertino: 'Vespertino',
};
