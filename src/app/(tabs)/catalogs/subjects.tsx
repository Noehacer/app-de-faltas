import { CatalogList } from '@/components/CatalogList';
import type { Subject } from '@/types/database';

export default function SubjectsScreen() {
  return (
    <CatalogList<Subject>
      table="subjects"
      fields={[{ key: 'name', label: 'Nombre de la materia', placeholder: 'Ej. Matemáticas' }]}
      renderItemLabel={(item) => item.name}
    />
  );
}
