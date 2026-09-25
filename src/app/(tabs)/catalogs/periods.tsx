import { CatalogList } from '@/components/CatalogList';
import { SHIFT_LABEL, SHIFTS } from '@/lib/shifts';
import type { ClassPeriod } from '@/types/database';

export default function PeriodsScreen() {
  return (
    <CatalogList<ClassPeriod>
      table="class_periods"
      fields={[{ key: 'label', label: 'Hora / periodo', placeholder: 'Ej. 1ra hora o 07:00 - 07:50' }]}
      choice={{ key: 'shift', label: 'Turno', options: SHIFTS.map((s) => ({ value: s.value, label: s.label })) }}
      renderItemLabel={(item) => item.label}
      renderItemSubtitle={(item) => `Turno ${SHIFT_LABEL[item.shift] ?? SHIFT_LABEL.matutino}`}
      extraValues={(currentList) => ({ sort_order: currentList.length })}
    />
  );
}
