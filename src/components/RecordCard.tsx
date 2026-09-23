import { StyleSheet, Text, View } from 'react-native';

import type { AttendanceRecordWithRelations } from '@/types/database';

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function RecordCard({ record }: { record: AttendanceRecordWithRelations }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>{formatDate(record.occurred_on)}</Text>
        <Text style={styles.period}>{record.class_periods.label}</Text>
      </View>
      <Text style={styles.student}>{record.students.full_name}</Text>
      <Text style={styles.detail}>
        {record.subjects.name} · {record.teachers.full_name}
      </Text>
      {record.reason ? (
        <Text style={styles.reason}>Razón: {record.reason}</Text>
      ) : (
        <Text style={styles.noReason}>Sin razón especificada</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  period: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  student: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  detail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: '#B45309',
  },
  noReason: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
