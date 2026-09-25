import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';

import { catalogService } from '@/services/catalogService';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';
import type { CatalogTable } from '@/types/database';

import { FormField } from './FormField';
import { Button, Chip, EmptyState, Screen } from './ui';

export type CatalogFieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
};

export type CatalogChoiceConfig = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

type CatalogListProps<T extends { id: string }> = {
  table: CatalogTable;
  fields: CatalogFieldConfig[];
  choice?: CatalogChoiceConfig;
  renderItemLabel: (item: T) => string;
  renderItemSubtitle?: (item: T) => string | null;
  extraValues?: (currentList: T[]) => Record<string, unknown>;
  emptyIcon?: React.ComponentProps<typeof Ionicons>['name'];
};

export function CatalogList<T extends { id: string }>({
  table,
  fields,
  choice,
  renderItemLabel,
  renderItemSubtitle,
  extraValues,
  emptyIcon = 'list-outline',
}: CatalogListProps<T>) {
  const theme = useTheme();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [choiceValue, setChoiceValue] = useState(choice?.options[0]?.value ?? '');

  const styles = useThemedStyles((t) => ({
    form: {
      margin: 16,
      marginBottom: 4,
      padding: 16,
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      ...cardShadow(t),
    },
    count: { fontSize: 13, fontWeight: '700', color: t.textMuted, marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
    listContent: { paddingHorizontal: 16, paddingBottom: 32 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      padding: 14,
      marginBottom: 8,
      ...cardShadow(t),
    },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 16, color: t.text, fontWeight: '700' },
    rowSubtitle: { fontSize: 13, color: t.textMuted, marginTop: 2 },
    choiceLabel: { fontSize: 13, fontWeight: '700', color: t.textMuted, marginBottom: 8, letterSpacing: 0.3 },
    choiceRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    deleteBtn: { padding: 8, borderRadius: radius.sm, backgroundColor: t.dangerSoft },
  }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await catalogService.list<T>(table));
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
      if (choice) values[choice.key] = choiceValue;
      if (extraValues) Object.assign(values, extraValues(items));
      await catalogService.create(table, values);
      setFormValues({});
      await load();
    } catch (error) {
      Alert.alert('Error', `No se pudo agregar: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: T) => {
    try {
      await catalogService.remove(table, item.id);
      await load();
    } catch {
      Alert.alert(
        'No se pudo eliminar',
        'Este registro está siendo usado en una o más faltas registradas, así que no se puede borrar.'
      );
    }
  };

  const handleDelete = (item: T) => {
    Alert.alert('Eliminar', `¿Eliminar "${renderItemLabel(item)}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(item) },
    ]);
  };

  return (
    <Screen>
      <View style={styles.form}>
        {fields.map((field, index) => (
          <FormField
            key={field.key}
            label={field.label}
            placeholder={field.placeholder}
            value={formValues[field.key] ?? ''}
            onChangeText={(text) => setFormValues((prev) => ({ ...prev, [field.key]: text }))}
            onSubmitEditing={index === fields.length - 1 ? handleAdd : undefined}
          />
        ))}
        {choice ? (
          <>
            <Text style={styles.choiceLabel}>{choice.label.toUpperCase()}</Text>
            <View style={styles.choiceRow}>
              {choice.options.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={choiceValue === option.value}
                  onPress={() => setChoiceValue(option.value)}
                />
              ))}
            </View>
          </>
        ) : null}
        <Button label="Agregar" icon="add-circle" onPress={handleAdd} loading={saving} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={theme.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={items.length ? <Text style={styles.count}>{items.length} REGISTRADOS</Text> : null}
          ListEmptyComponent={
            <EmptyState icon={emptyIcon} title="Todavía no hay registros" hint="Agrega el primero con el formulario de arriba." />
          }
          renderItem={({ item }) => {
            const subtitle = renderItemSubtitle?.(item);
            return (
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{renderItemLabel(item)}</Text>
                  {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
                </View>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)} accessibilityLabel="Eliminar">
                  <Ionicons name="trash-outline" size={18} color={theme.danger} />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}
