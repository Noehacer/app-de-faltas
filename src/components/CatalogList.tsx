import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { catalogService } from '@/services/catalogService';
import type { CatalogTable } from '@/types/database';

import { FormField } from './FormField';

export type CatalogFieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
};

type CatalogListProps<T extends { id: string }> = {
  table: CatalogTable;
  fields: CatalogFieldConfig[];
  renderItemLabel: (item: T) => string;
  renderItemSubtitle?: (item: T) => string | null;
  extraValues?: (currentList: T[]) => Record<string, unknown>;
};

export function CatalogList<T extends { id: string }>({
  table,
  fields,
  renderItemLabel,
  renderItemSubtitle,
  extraValues,
}: CatalogListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogService.list<T>(table);
      setItems(data);
    } catch (error) {
      Alert.alert('Error', `No se pudo cargar la lista: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const requiredField = fields[0];
    if (!formValues[requiredField.key]?.trim()) {
      Alert.alert('Falta información', `Escribe ${requiredField.label.toLowerCase()}.`);
      return;
    }

    setSaving(true);
    try {
      const values: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = formValues[field.key]?.trim();
        values[field.key] = raw ? raw : null;
      }
      if (extraValues) {
        Object.assign(values, extraValues(items));
      }
      await catalogService.create(table, values);
      setFormValues({});
      await load();
    } catch (error) {
      Alert.alert('Error', `No se pudo agregar: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: T) => {
    Alert.alert('Eliminar', `¿Eliminar "${renderItemLabel(item)}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await catalogService.remove(table, item.id);
            await load();
          } catch {
            Alert.alert(
              'No se pudo eliminar',
              'Este registro está siendo usado en una o más faltas registradas, así que no se puede borrar.'
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {fields.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            placeholder={field.placeholder}
            value={formValues[field.key] ?? ''}
            onChangeText={(text) => setFormValues((prev) => ({ ...prev, [field.key]: text }))}
          />
        ))}
        <Pressable style={styles.addButton} onPress={handleAdd} disabled={saving}>
          <Text style={styles.addButtonText}>{saving ? 'Guardando...' : 'Agregar'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Todavía no hay registros.</Text>}
          renderItem={({ item }) => {
            const subtitle = renderItemSubtitle?.(item);
            return (
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{renderItemLabel(item)}</Text>
                  {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
                </View>
                <Pressable onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  loader: {
    marginTop: 24,
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
