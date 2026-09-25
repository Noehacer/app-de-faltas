import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui';
import { colorsFor } from '@/lib/colors';
import { addDays, toIso } from '@/lib/dates';
import { SHIFT_LABEL } from '@/lib/shifts';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';
import type { ClassPeriod, ScheduleSlot, Shift, Subject, Teacher } from '@/types/database';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const CELL_W = 104;
const CELL_H = 74;
const PERIOD_W = 84;

type ScheduleGridProps = {
  shift: Shift;
  shiftPeriods: ClassPeriod[];
  weekStart: Date;
  group: string | null;
  selected: { weekday: number; periodId: string } | null;
  onSelectCell: (weekday: number, periodId: string) => void;
  slotByKey: Map<string, ScheduleSlot>;
  subjectById: Map<string, Subject>;
  teacherById: Map<string, Teacher>;
  absenceCount: Map<string, number>;
  totalAbsences: number;
  isAdmin: boolean;
};

export function ScheduleGrid({
  shift,
  shiftPeriods,
  weekStart,
  group,
  selected,
  onSelectCell,
  slotByKey,
  subjectById,
  teacherById,
  absenceCount,
  totalAbsences,
  isAdmin,
}: ScheduleGridProps) {
  const theme = useTheme();
  const dark = theme.scheme === 'dark';
  const today = toIso(new Date());

  const styles = useThemedStyles((t) => ({
    gridWrap: { marginHorizontal: 16, backgroundColor: t.surface, borderRadius: radius.lg, padding: 8, ...cardShadow(t) },
    row: { flexDirection: 'row' },
    headCell: { width: CELL_W, alignItems: 'center', paddingVertical: 8 },
    headDay: { fontSize: 13, fontWeight: '800', color: t.text },
    headDate: { fontSize: 11, color: t.textMuted, fontWeight: '600' },
    headToday: { color: t.primary },
    periodCell: { width: PERIOD_W, height: CELL_H, justifyContent: 'center', paddingHorizontal: 6 },
    periodText: { fontSize: 12.5, fontWeight: '800', color: t.text },
    cellOuter: { width: CELL_W, height: CELL_H, padding: 3 },
    cell: { flex: 1, borderRadius: radius.md, padding: 8, justifyContent: 'center', overflow: 'hidden' },
    cellEmpty: { backgroundColor: t.surfaceAlt, alignItems: 'center' },
    cellSelected: { borderWidth: 2, borderColor: t.primary },
    cellSubject: { fontSize: 12.5, fontWeight: '800' },
    cellTeacher: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    absBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 5,
      backgroundColor: t.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    absBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
    legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 10 },
    legendText: { fontSize: 12, color: t.textMuted, fontWeight: '600' },
  }));

  if (!shiftPeriods.length) {
    return (
      <EmptyState
        icon="time-outline"
        title={`No hay horas del turno ${SHIFT_LABEL[shift].toLowerCase()}`}
        hint="El encargado puede agregarlas en Catálogos → Horarios, eligiendo el turno."
      />
    );
  }

  return (
    <>
      <View style={styles.gridWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.row}>
              <View style={{ width: PERIOD_W }} />
              {DAYS.map((d, i) => {
                const iso = toIso(addDays(weekStart, i));
                return (
                  <View key={d} style={styles.headCell}>
                    <Text style={[styles.headDay, iso === today && styles.headToday]}>{d}</Text>
                    <Text style={[styles.headDate, iso === today && styles.headToday]}>{addDays(weekStart, i).getDate()}</Text>
                  </View>
                );
              })}
            </View>
            {shiftPeriods.map((period) => (
              <View key={period.id} style={styles.row}>
                <View style={styles.periodCell}>
                  <Text style={styles.periodText} numberOfLines={2}>
                    {period.label}
                  </Text>
                </View>
                {[1, 2, 3, 4, 5].map((weekday) => {
                  const key = `${weekday}-${period.id}`;
                  const slot = slotByKey.get(key);
                  const count = absenceCount.get(key) ?? 0;
                  const isSelected = selected?.weekday === weekday && selected.periodId === period.id;
                  const subject = slot ? subjectById.get(slot.subject_id) : undefined;
                  const teacher = slot ? teacherById.get(slot.teacher_id) : undefined;
                  const c = slot ? colorsFor(slot.subject_id, dark) : null;
                  return (
                    <View key={key} style={styles.cellOuter}>
                      <Pressable
                        onPress={() => onSelectCell(weekday, period.id)}
                        style={[
                          styles.cell,
                          slot ? { backgroundColor: c!.bg } : styles.cellEmpty,
                          isSelected && styles.cellSelected,
                        ]}
                      >
                        {slot ? (
                          <>
                            <Text style={[styles.cellSubject, { color: c!.fg }]} numberOfLines={2}>
                              {subject?.name ?? 'Materia'}
                            </Text>
                            <Text style={[styles.cellTeacher, { color: c!.fg }]} numberOfLines={1}>
                              {teacher?.full_name ?? ''}
                            </Text>
                          </>
                        ) : (
                          <Ionicons name={isAdmin ? 'add' : 'remove'} size={18} color={theme.placeholder} />
                        )}
                        {count > 0 ? (
                          <View style={styles.absBadge}>
                            <Text style={styles.absBadgeText}>{count}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.legend}>
        <View style={[styles.absBadge, { position: 'relative', top: 0, right: 0, minWidth: 16, height: 16 }]} />
        <Text style={styles.legendText}>
          Faltas de la semana en {group}: {totalAbsences}
        </Text>
      </View>
    </>
  );
}
