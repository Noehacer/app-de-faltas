import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { radius, useTheme, useThemedStyles } from '@/theme';

import { EmptyState } from './ui';

export type SelectOption = {
  id: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (id: string) => void;
};

export function SelectField({
  label,
  placeholder = 'Selecciona una opción',
  options,
  value,
  onChange,
}: SelectFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const styles = useThemedStyles((t) => ({
    container: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '700', color: t.textMuted, marginBottom: 6, letterSpacing: 0.3 },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: t.surface,
    },
    triggerText: { fontSize: 16, color: t.text, flex: 1 },
    triggerPlaceholder: { fontSize: 16, color: t.placeholder, flex: 1 },
    overlay: { flex: 1, backgroundColor: t.overlay, justifyContent: 'flex-end', alignItems: 'center' },
    sheet: {
      backgroundColor: t.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: '80%',
      width: '100%',
      maxWidth: 560,
    },
    handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: t.border, marginBottom: 14 },
    sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12, color: t.text },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    searchInput: { flex: 1, paddingVertical: 11, fontSize: 16, color: t.text, outlineStyle: 'none' } as never,
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    optionText: { fontSize: 16, color: t.text },
    optionActive: { fontWeight: '700', color: t.primary },
    closeButton: { paddingVertical: 14, alignItems: 'center' },
    closeButtonText: { fontSize: 15, color: t.textMuted, fontWeight: '600' },
  }));

  const selected = options.find((option) => option.id === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, search]);

  const close = () => {
    setSearch('');
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.triggerText : styles.triggerPlaceholder} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.placeholder} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={theme.placeholder} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                placeholderTextColor={theme.placeholder}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <EmptyState icon="folder-open-outline" title="Sin opciones" hint="Pide al encargado que agregue registros en Catálogos." />
              }
              renderItem={({ item }) => {
                const active = item.id === value;
                return (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      onChange(item.id);
                      close();
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionActive]}>{item.label}</Text>
                    {active ? <Ionicons name="checkmark-circle" size={20} color={theme.primary} /> : null}
                  </Pressable>
                );
              }}
            />
            <Pressable style={styles.closeButton} onPress={close}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
