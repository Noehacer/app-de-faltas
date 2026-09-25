import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { shortDateParts } from '@/lib/dates';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';
import type { AttendanceRecordWithRelations } from '@/types/database';

import { Badge } from './ui';

export function RecordCard({ record }: { record: AttendanceRecordWithRelations }) {
  const theme = useTheme();
  const { day, month } = shortDateParts(record.occurred_on);
  const styles = useThemedStyles((t) => ({
    card: {
      flexDirection: 'row',
      gap: 14,
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 14,
      marginBottom: 12,
      ...cardShadow(t),
    },
    date: {
      width: 54,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.primarySoft,
      borderRadius: radius.md,
      paddingVertical: 8,
    },
    day: { fontSize: 22, fontWeight: '800', color: t.primary },
    month: { fontSize: 12, fontWeight: '700', color: t.primary, textTransform: 'uppercase' },
    body: { flex: 1, gap: 4 },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    student: { fontSize: 17, fontWeight: '800', color: t.text, flexShrink: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detail: { fontSize: 13.5, color: t.textMuted, flexShrink: 1 },
    reasonBox: {
      marginTop: 6,
      backgroundColor: t.warningSoft,
      borderRadius: radius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    reason: { fontSize: 13, color: t.warning, fontWeight: '600' },
    noReason: { fontSize: 12.5, color: t.placeholder, fontStyle: 'italic', marginTop: 4 },
  }));

  return (
    <View style={styles.card}>
      <View style={styles.date}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.month}>{month}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.student} numberOfLines={1}>
            {record.students.full_name}
          </Text>
          <Badge label={record.class_periods.label} tone="primary" />
        </View>
        <View style={styles.row}>
          <Ionicons name="book-outline" size={14} color={theme.textMuted} />
          <Text style={styles.detail}>{record.subjects.name}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={14} color={theme.textMuted} />
          <Text style={styles.detail}>{record.teachers.full_name}</Text>
        </View>
        {record.reason ? (
          <View style={styles.reasonBox}>
            <Text style={styles.reason}>Razón: {record.reason}</Text>
          </View>
        ) : (
          <Text style={styles.noReason}>Sin razón especificada</Text>
        )}
      </View>
    </View>
  );
}
