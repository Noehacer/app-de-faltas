import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { Chip } from '@/components/ui';
import { addDays, mondayOf, MONTHS } from '@/lib/dates';
import { SHIFTS } from '@/lib/shifts';
import { radius, useTheme, useThemedStyles } from '@/theme';
import type { Shift } from '@/types/database';

type ScheduleFiltersProps = {
  shift: Shift;
  onShiftChange: (shift: Shift) => void;
  groups: string[];
  group: string | null;
  onGroupChange: (group: string) => void;
  weekStart: Date;
  onWeekStartChange: (weekStart: Date) => void;
};

export function ScheduleFilters({
  shift,
  onShiftChange,
  groups,
  group,
  onGroupChange,
  weekStart,
  onWeekStartChange,
}: ScheduleFiltersProps) {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    top: { padding: 16, paddingBottom: 8, gap: 12 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    weekBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: t.surface,
      borderRadius: radius.md,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    weekBtn: { padding: 8, borderRadius: radius.sm },
    weekText: { fontSize: 14, fontWeight: '800', color: t.text },
  }));

  const rangeLabel = `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} - ${addDays(weekStart, 4).getDate()} ${MONTHS[addDays(weekStart, 4).getMonth()]}`;

  return (
    <View style={styles.top}>
      <View style={styles.chips}>
        {SHIFTS.map((s) => (
          <Chip key={s.value} label={s.label} active={shift === s.value} onPress={() => onShiftChange(s.value)} />
        ))}
      </View>
      <View style={styles.chips}>
        {groups.map((g) => (
          <Chip key={g} label={g} active={group === g} onPress={() => onGroupChange(g)} />
        ))}
      </View>
      <View style={styles.weekBar}>
        <Pressable
          style={styles.weekBtn}
          onPress={() => onWeekStartChange(addDays(weekStart, -7))}
          accessibilityLabel="Semana anterior"
        >
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
        <Pressable onPress={() => onWeekStartChange(mondayOf(new Date()))}>
          <Text style={styles.weekText}>{rangeLabel}</Text>
        </Pressable>
        <Pressable
          style={styles.weekBtn}
          onPress={() => onWeekStartChange(addDays(weekStart, 7))}
          accessibilityLabel="Semana siguiente"
        >
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </Pressable>
      </View>
    </View>
  );
}
