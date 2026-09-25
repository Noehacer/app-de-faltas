import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { addDays, mondayOf, toIso, weekdayOf } from '@/lib/dates';
import { reportError } from '@/lib/errors';
import { catalogService } from '@/services/catalogService';
import { scheduleService, type WeekAbsence } from '@/services/scheduleService';
import type { ClassPeriod, Shift, ScheduleSlot, Subject, Teacher } from '@/types/database';

export type ScheduleSelection = { weekday: number; periodId: string };

export function useScheduleData() {
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
  const [selected, setSelected] = useState<ScheduleSelection | null>(null);
  const [editSubject, setEditSubject] = useState<string | null>(null);
  const [editTeacher, setEditTeacher] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [prevFilters, setPrevFilters] = useState({ group, shift, weekStart });
  const [prevSelectionSignature, setPrevSelectionSignature] = useState<string | null>(null);
  const reportKeyRef = useRef(0);

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
      Alert.alert('Error', `No se pudo cargar el horario: ${reportError('schedule-load-base', error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusRefresh(loadBase);

  const loadSlots = useCallback(async () => {
    if (!group) {
      setSlots([]);
      return;
    }
    try {
      setSlots(await scheduleService.listSlots(group));
    } catch (error) {
      Alert.alert('Error', reportError('schedule-load-slots', error));
    }
  }, [group]);

  const loadAbsences = useCallback(async () => {
    try {
      setAbsences(await scheduleService.listWeekAbsences(toIso(weekStart), toIso(addDays(weekStart, 6))));
    } catch (error) {
      reportError('schedule-load-absences', error);
      setAbsences([]);
    }
  }, [weekStart]);

  useEffect(() => {
    loadSlots(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadSlots]);

  useEffect(() => {
    loadAbsences(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadAbsences]);

  if (prevFilters.group !== group || prevFilters.shift !== shift || prevFilters.weekStart !== weekStart) {
    setPrevFilters({ group, shift, weekStart });
    setSelected(null);
  }

  const shiftPeriods = useMemo(
    () => periods.filter((p) => (p.shift ?? 'matutino') === shift).sort((a, b) => a.sort_order - b.sort_order),
    [periods, shift]
  );

  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const teacherById = useMemo(() => new Map(teachers.map((t) => [t.id, t])), [teachers]);
  const slotByKey = useMemo(() => new Map(slots.map((s) => [`${s.weekday}-${s.class_period_id}`, s])), [slots]);

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

  const selectionSignature = selected ? `${selectedSlot?.id ?? 'none'}-${selected.weekday}-${selected.periodId}` : null;
  if (selectionSignature !== prevSelectionSignature) {
    setPrevSelectionSignature(selectionSignature);
    setEditSubject(selectedSlot?.subject_id ?? null);
    setEditTeacher(selectedSlot?.teacher_id ?? null);
  }

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
      Alert.alert('No se pudo guardar', reportError('schedule-save-slot', error));
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
      Alert.alert('No se pudo quitar', reportError('schedule-remove-slot', error));
    }
  };

  const handleReport = () => {
    if (!selected || !selectedDate) return;
    reportKeyRef.current += 1;
    const params: Record<string, string> = {
      k: String(reportKeyRef.current),
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

  return {
    loading,
    groups,
    subjects,
    teachers,
    shift,
    setShift,
    group,
    setGroup,
    weekStart,
    setWeekStart,
    selected,
    setSelected,
    shiftPeriods,
    subjectById,
    teacherById,
    slotByKey,
    absenceCount,
    totalAbsences,
    selectedSlot,
    selectedPeriod,
    selectedDate,
    editSubject,
    setEditSubject,
    editTeacher,
    setEditTeacher,
    saving,
    handleSave,
    handleClear,
    handleReport,
  };
}
