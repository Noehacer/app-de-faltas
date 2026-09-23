import { CatalogList } from '@/components/CatalogList';
import type { Student } from '@/types/database';

export default function StudentsScreen() {
  return (
    <CatalogList<Student>
      table="students"
      fields={[
        { key: 'full_name', label: 'Nombre completo', placeholder: 'Ej. María López' },
        { key: 'grade_group', label: 'Grado/grupo (opcional)', placeholder: 'Ej. 3ro A' },
      ]}
      renderItemLabel={(item) => item.full_name}
      renderItemSubtitle={(item) => item.grade_group}
    />
  );
}
