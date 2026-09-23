import { CatalogList } from '@/components/CatalogList';
import type { Teacher } from '@/types/database';

export default function TeachersScreen() {
  return (
    <CatalogList<Teacher>
      table="teachers"
      fields={[{ key: 'full_name', label: 'Nombre completo', placeholder: 'Ej. Juan Pérez' }]}
      renderItemLabel={(item) => item.full_name}
    />
  );
}
