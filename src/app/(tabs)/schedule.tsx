import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { SelectField } from '@/components/SelectField';
import { Button, Chip, EmptyState, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { SHIFT_LABEL, SHIFTS } from '@/lib/shifts';
import { catalogService } from '@/services/catalogService';
import { scheduleService, type WeekAbsence } from '@/services/scheduleService';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';
import type { ClassPeriod, ScheduleSlot, Shift, Subject, Teacher } from '@/types/database';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const DAYS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const CELL_W = 104;
const CELL_H = 74;
const PERIOD_W = 84;

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function mondayOf(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function weekdayOf(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function hueOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return hash;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export default function ScheduleScreen() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const dark = theme.scheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<string[]>([]);
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [shift, setShift] = useState<Shift>('matutino');
  const [group, setGroup] = useState<string | null>(null);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [absences, setAbsences] = useState<WeekAbsence[]>([]);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [selected, setSelected] = useState<{ weekday: number; periodId: string } | null>(null);
  const [editSubject, setEditSubject] = useState<string | null>(null);
  const [editTeacher, setEditTeacher] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    panel: { margin: 16, padding: 16, backgroundColor: t.surface, borderRadius: radius.lg, gap: 12, ...cardShadow(t) },
    panelTitle: { fontSize: 17, fontWeight: '900', color: t.text },
    panelLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    panelText: { fontSize: 14, color: t.textMuted, flexShrink: 1 },
    hint: { fontSize: 13, color: t.textMuted, textAlign: 'center', marginHorizontal: 16, marginTop: 12 },
    legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 10 },
    legendText: { fontSize: 12, color: t.textMuted, fontWeight: '600' },
  }));

  const loadBase = useCallback(async () => {
    try {
      const [groupsData, periodsData, subjectsData, teachersData] = await Promise.all([
        scheduleService.listGroups(),
        catalogService.list<ClassPeriod>('class_periods'),
        catalogService.list<Subject>('subjects'),
        catalogService.list<Teacher>('teachers'),
      ]);
      setGroups(groupsData);
      setPeriods(periodsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setGroup((current) => (current && groupsData.includes(current) ? current : groupsData[0] ?? null));
    } catch (error) {
      Alert.alert('Error', `No se pudo cargar el horario: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBase();
    }, [loadBase])
  );

  const loadSlots = useCallback(async () => {
    if (!group) {
      setSlots([]);
      return;
    }
    try {
      setSlots(await scheduleService.listSlots(group));
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }, [group]);

  const loadAbsences = useCallback(async () => {
    try {
      setAbsences(await scheduleService.listWeekAbsences(toIso(weekStart), toIso(addDays(weekStart, 6))));
    } catch {
      setAbsences([]);
    }
  }, [weekStart]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

  useEffect(() => {
    setSelected(null);
  }, [group, shift, weekStart]);

  const shiftPeriods = useMemo(
    () => periods.filter((p) => (p.shift ?? 'matutino') === shift).sort((a, b) => a.sort_order - b.sort_order),
    [periods, shift]
  );

  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const teacherById = useMemo(() => new Map(teachers.map((t) => [t.id, t])), [teachers]);
  const slotByKey = useMemo(
    () => new Map(slots.map((s) => [`${s.weekday}-${s.class_period_id}`, s])),
    [slots]
  );

  const absenceCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of absences) {
      if (a.students?.grade_group?.trim() !== group) continue;
      const day = weekdayOf(a.occurred_on);
      if (day < 1 || day > 5) continue;
      const key = `${day}-${a.class_period_id}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [absences, group]);

  const totalAbsences = useMemo(
    () => shiftPeriods.reduce((sum, p) => sum + [1, 2, 3, 4, 5].reduce((s, d) => s + (absenceCount.get(`${d}-${p.id}`) ?? 0), 0), 0),
    [absenceCount, shiftPeriods]
  );

  const selectedSlot = selected ? slotByKey.get(`${selected.weekday}-${selected.periodId}`) : undefined;
  const selectedPeriod = selected ? periods.find((p) => p.id === selected.periodId) : undefined;
  const selectedDate = selected ? addDays(weekStart, selected.weekday - 1) : null;

  useEffect(() => {
    setEditSubject(selectedSlot?.subject_id ?? null);
    setEditTeacher(selectedSlot?.teacher_id ?? null);
  }, [selectedSlot?.id, selected?.weekday, selected?.periodId]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = toIso(new Date());
  const rangeLabel = `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} - ${addDays(weekStart, 4).getDate()} ${MONTHS[addDays(weekStart, 4).getMonth()]}`;

  const colorsFor = (id: string) => {
    const h = hueOf(id);
    return dark
      ? { bg: `hsl(${h}, 35%, 24%)`, fg: `hsl(${h}, 80%, 82%)` }
      : { bg: `hsl(${h}, 85%, 91%)`, fg: `hsl(${h}, 65%, 26%)` };
  };

  const handleSave = async () => {
    if (!group || !selected || !editSubject || !editTeacher) {
      Alert.alert('Falta información', 'Elige la materia y el maestro.');
      return;
    }
    setSaving(true);
    try {
      await scheduleService.saveSlot({
        group_name: group,
        weekday: selected.weekday,
        class_period_id: selected.periodId,
        subject_id: editSubject,
        teacher_id: editTeacher,
      });
      await loadSlots();
    } catch (error) {
      Alert.alert('No se pudo guardar', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!selectedSlot) return;
    try {
      await scheduleService.removeSlot(selectedSlot.id);
      await loadSlots();
    } catch (error) {
      Alert.alert('No se pudo quitar', (error as Error).message);
    }
  };

  const handleReport = () => {
    if (!selected || !selectedDate) return;
    const params: Record<string, string> = {
      k: String(Date.now()),
      period: selected.periodId,
      date: toIso(selectedDate),
    };
    if (group) params.group = group;
    if (selectedSlot) {
      params.subject = selectedSlot.subject_id;
      params.teacher = selectedSlot.teacher_id;
    }
    router.navigate({ pathname: '/new-record', params } as never);
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator style={{ marginTop: 48 }} color={theme.primary} />
      </Screen>
    );
  }

  if (!groups.length) {
    return (
      <Screen>
        <EmptyState
          icon="calendar-outline"
          title="Aún no hay grupos"
          hint="Agrega alumnos con su grado y grupo en Catálogos (por ejemplo 3ro A) para armar su horario."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.top}>
          <View style={styles.chips}>
            {SHIFTS.map((s) => (
              <Chip key={s.value} label={s.label} active={shift === s.value} onPress={() => setShift(s.value)} />
            ))}
          </View>
          <View style={styles.chips}>
            {groups.map((g) => (
              <Chip key={g} label={g} active={group === g} onPress={() => setGroup(g)} />
            ))}
          </View>
          <View style={styles.weekBar}>
            <Pressable style={styles.weekBtn} onPress={() => setWeekStart(addDays(weekStart, -7))} accessibilityLabel="Semana anterior">
              <Ionicons name="chevron-back" size={20} color={theme.primary} />
            </Pressable>
            <Pressable onPress={() => setWeekStart(mondayOf(new Date()))}>
              <Text style={styles.weekText}>{rangeLabel}</Text>
            </Pressable>
            <Pressable style={styles.weekBtn} onPress={() => setWeekStart(addDays(weekStart, 7))} accessibilityLabel="Semana siguiente">
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </Pressable>
          </View>
        </View>

        {!shiftPeriods.length ? (
          <EmptyState
            icon="time-outline"
            title={`No hay horas del turno ${SHIFT_LABEL[shift].toLowerCase()}`}
            hint="El encargado puede agregarlas en Catálogos → Horarios, eligiendo el turno."
          />
        ) : (
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
                        const c = slot ? colorsFor(slot.subject_id) : null;
                        return (
                          <View key={key} style={styles.cellOuter}>
                            <Pressable
                              onPress={() => setSelected({ weekday, periodId: period.id })}
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
        )}

        {selected && selectedDate && selectedPeriod ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>
              {DAYS_LONG[selected.weekday - 1]} {selectedDate.getDate()} · {selectedPeriod.label}
            </Text>
            <View style={styles.panelLine}>
              <Ionicons name="book-outline" size={16} color={theme.textMuted} />
              <Text style={styles.panelText}>
                {selectedSlot ? subjectById.get(selectedSlot.subject_id)?.name : 'Sin clase asignada'}
              </Text>
            </View>
            {selectedSlot ? (
              <View style={styles.panelLine}>
                <Ionicons name="person-outline" size={16} color={theme.textMuted} />
                <Text style={styles.panelText}>{teacherById.get(selectedSlot.teacher_id)?.full_name}</Text>
              </View>
            ) : null}
            <View style={styles.panelLine}>
              <Ionicons name="person-remove-outline" size={16} color={theme.textMuted} />
              <Text style={styles.panelText}>
                {absenceCount.get(`${selected.weekday}-${selected.periodId}`) ?? 0} faltas esa semana
              </Text>
            </View>

            <Button label="Reportar falta aquí" icon="flag" onPress={handleReport} />

            {isAdmin ? (
              <>
                <SelectField
                  label="Materia"
                  options={subjects.map((s) => ({ id: s.id, label: s.name }))}
                  value={editSubject}
                  onChange={setEditSubject}
                />
                <SelectField
                  label="Maestro"
                  options={teachers.map((t) => ({ id: t.id, label: t.full_name }))}
                  value={editTeacher}
                  onChange={setEditTeacher}
                />
                <Button label="Guardar en el horario" icon="save" variant="secondary" onPress={handleSave} loading={saving} />
                {selectedSlot ? <Button label="Quitar clase" icon="trash-outline" variant="danger" onPress={handleClear} /> : null}
              </>
            ) : null}
          </View>
        ) : (
          <Text style={styles.hint}>
            {isAdmin ? 'Toca una celda para editarla o reportar una falta.' : 'Toca una celda para reportar una falta.'}
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
