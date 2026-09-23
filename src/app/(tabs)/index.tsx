import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormField } from '@/components/FormField';
import { RecordCard } from '@/components/RecordCard';
import { attendanceService, type AttendanceDateFilter } from '@/services/attendanceService';
import type { AttendanceRecordWithRelations } from '@/types/database';

const FILTERS: { key: AttendanceDateFilter; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'all', label: 'Todas' },
];

export default function HomeScreen() {
  const [dateFilter, setDateFilter] = useState<AttendanceDateFilter>('today');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AttendanceRecordWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await attendanceService.list(dateFilter);
      setRecords(data);
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
        record.teachers.full_name.toLowerCase().includes(term)
    );
  }, [records, search]);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.key}
            style={[styles.filterChip, dateFilter === filter.key && styles.filterChipActive]}
            onPress={() => {
              setLoading(true);
              setDateFilter(filter.key);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                dateFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <FormField
          label=""
          placeholder="Buscar por alumno o maestro..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay faltas registradas en este periodo.</Text>
          }
          renderItem={({ item }) => <RecordCard record={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loader: {
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 24,
  },
});
