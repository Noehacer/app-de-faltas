import { CatalogList } from '@/components/CatalogList';
import type { ClassPeriod } from '@/types/database';

export default function PeriodsScreen() {
  return (
    <CatalogList<ClassPeriod>
      table="class_periods"
      fields={[{ key: 'label', label: 'Hora / periodo', placeholder: 'Ej. 1ra hora o 07:00 - 07:50' }]}
      renderItemLabel={(item) => item.label}
      extraValues={(currentList) => ({ sort_order: currentList.length })}
    />
  );
}
