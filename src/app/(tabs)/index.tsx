import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';

import { RecordCard } from '@/components/RecordCard';
import { Chip, EmptyState, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { attendanceService, type AttendanceDateFilter } from '@/services/attendanceService';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';
import type { AttendanceRecordWithRelations } from '@/types/database';

const FILTERS: { key: AttendanceDateFilter; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'all', label: 'Todas' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [dateFilter, setDateFilter] = useState<AttendanceDateFilter>('today');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AttendanceRecordWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useThemedStyles((t) => ({
    header: { paddingTop: 16 },
    hello: { fontSize: 13, color: t.textMuted, fontWeight: '600' },
    name: { fontSize: 24, fontWeight: '900', color: t.text, marginBottom: 14, letterSpacing: -0.4 },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: t.primary,
      borderRadius: radius.lg,
      padding: 16,
      marginBottom: 14,
      ...cardShadow(t),
    },
    statIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statNumber: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
    statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: t.text, outlineStyle: 'none' } as never,
    chips: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  }));

  const load = useCallback(async () => {
    try {
      setRecords(await attendanceService.list(dateFilter));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const term = search.trim().toLowerCase();
    return records.filter(
      (record) =>
        record.students.full_name.toLowerCase().includes(term) ||
        record.teachers.full_name.toLowerCase().includes(term) ||
        record.subjects.name.toLowerCase().includes(term)
    );
  }, [records, search]);

  const periodLabel = FILTERS.find((f) => f.key === dateFilter)?.label.toLowerCase();

  const header = (
    <View style={styles.header}>
      <Text style={styles.hello}>Hola,</Text>
      <Text style={styles.name}>{profile?.full_name ?? 'bienvenido'}</Text>

      <View style={styles.stat}>
        <View style={styles.statIcon}>
          <Ionicons name="person-remove" size={24} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.statNumber}>{filtered.length}</Text>
          <Text style={styles.statLabel}>
            {filtered.length === 1 ? 'falta registrada' : 'faltas registradas'} · {periodLabel}
          </Text>
        </View>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={theme.placeholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alumno, maestro o materia"
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.chips}>
        {FILTERS.map((filter) => (
          <Chip
            key={filter.key}
            label={filter.label}
            active={dateFilter === filter.key}
            onPress={() => {
              setLoading(true);
              setDateFilter(filter.key);
            }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.primary}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 32 }} color={theme.primary} />
          ) : (
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="Sin faltas en este periodo"
              hint="Cuando se registre una falta aparecerá aquí."
            />
          )
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 0 }}>
            <RecordCard record={item} />
          </View>
        )}
      />
    </Screen>
  );
}
