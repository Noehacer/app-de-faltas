import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { SelectField, type SelectOption } from '@/components/SelectField';
import { Button, Chip, Screen } from '@/components/ui';
import { SHIFT_LABEL } from '@/lib/shifts';
import { attendanceService } from '@/services/attendanceService';
import { catalogService } from '@/services/catalogService';
import { cardShadow, radius, useThemedStyles } from '@/theme';
import type { ClassPeriod, Student, Subject, Teacher } from '@/types/database';

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function NewRecordScreen() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const [occurredOn, setOccurredOn] = useState(isoDaysAgo(0));
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const params = useLocalSearchParams<{
    k?: string;
    period?: string;
    subject?: string;
    teacher?: string;
    group?: string;
    date?: string;
  }>();

  useEffect(() => {
    if (!params.k) return;
    setPeriodId(params.period ?? null);
    setSubjectId(params.subject ?? null);
    setTeacherId(params.teacher ?? null);
    setStudentId(null);
    setGroup(params.group ?? null);
    if (params.date) setOccurredOn(params.date);
  }, [params.k]); // eslint-disable-line react-hooks/exhaustive-deps

  const styles = useThemedStyles((t) => ({
    container: { flex: 1, backgroundColor: t.background },
    content: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, ...cardShadow(t) },
    warning: {
      backgroundColor: t.warningSoft,
      padding: 12,
      borderRadius: radius.md,
      marginBottom: 16,
    },
    warningText: { color: t.warning, fontSize: 13, fontWeight: '600' },
    label: { fontSize: 13, fontWeight: '700', color: t.textMuted, marginBottom: 8, letterSpacing: 0.3 },
    chips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    groupRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  }));

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    try {
      const [teachersData, subjectsData, studentsData, periodsData] = await Promise.all([
        catalogService.list<Teacher>('teachers'),
        catalogService.list<Subject>('subjects'),
        catalogService.list<Student>('students'),
        catalogService.list<ClassPeriod>('class_periods'),
      ]);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setStudents(studentsData);
      setPeriods(periodsData);
    } catch (error) {
      Alert.alert('Error', `No se pudieron cargar los catálogos: ${(error as Error).message}`);
    } finally {
      setLoadingCatalogs(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCatalogs();
    }, [loadCatalogs])
  );

  const periodOptions: SelectOption[] = useMemo(
    () => periods.map((p) => ({ id: p.id, label: `${p.label} · ${SHIFT_LABEL[p.shift] ?? SHIFT_LABEL.matutino}` })),
    [periods]
  );
  const subjectOptions: SelectOption[] = useMemo(() => subjects.map((s) => ({ id: s.id, label: s.name })), [subjects]);
  const teacherOptions: SelectOption[] = useMemo(() => teachers.map((t) => ({ id: t.id, label: t.full_name })), [teachers]);
  const studentOptions: SelectOption[] = useMemo(
    () => students
      .filter((s) => !group || s.grade_group?.trim() === group)
      .map((s) => ({ id: s.id, label: s.grade_group ? `${s.full_name} · ${s.grade_group}` : s.full_name })),
    [students]
  );

  const resetForm = () => {
    setPeriodId(null);
    setSubjectId(null);
    setTeacherId(null);
    setStudentId(null);
    setReason('');
    setGroup(null);
    setOccurredOn(isoDaysAgo(0));
  };

  const handleSubmit = async () => {
    if (!periodId || !subjectId || !teacherId || !studentId) {
      Alert.alert('Falta información', 'Selecciona hora, materia, maestro y alumno.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
      Alert.alert('Fecha inválida', 'Usa el formato AAAA-MM-DD.');
      return;
    }
    setSaving(true);
    try {
      await attendanceService.create({
        occurred_on: occurredOn,
        class_period_id: periodId,
        subject_id: subjectId,
        teacher_id: teacherId,
        student_id: studentId,
        reason: reason.trim() ? reason.trim() : null,
      });
      Alert.alert('Guardado', 'La falta se registró correctamente.');
      resetForm();
    } catch (error) {
      Alert.alert('Error', `No se pudo guardar: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const catalogsEmpty =
    !loadingCatalogs && (periods.length === 0 || subjects.length === 0 || teachers.length === 0 || students.length === 0);

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {catalogsEmpty ? (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Faltan maestros, materias, alumnos u horarios. Pide al encargado que los cargue en Catálogos.
              </Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.label}>FECHA</Text>
            <View style={styles.chips}>
              <Chip label="Hoy" active={occurredOn === isoDaysAgo(0)} onPress={() => setOccurredOn(isoDaysAgo(0))} />
              <Chip label="Ayer" active={occurredOn === isoDaysAgo(1)} onPress={() => setOccurredOn(isoDaysAgo(1))} />
            </View>
            <FormField icon="calendar-outline" value={occurredOn} onChangeText={setOccurredOn} placeholder="AAAA-MM-DD" />

            {group ? (
              <View style={styles.groupRow}>
                <Chip label={`Grupo ${group} ✕`} active onPress={() => setGroup(null)} />
              </View>
            ) : null}

            <SelectField label="Hora / periodo" options={periodOptions} value={periodId} onChange={setPeriodId} />
            <SelectField label="Materia" options={subjectOptions} value={subjectId} onChange={setSubjectId} />
            <SelectField label="Maestro" options={teacherOptions} value={teacherId} onChange={setTeacherId} />
            <SelectField label="Alumno" options={studentOptions} value={studentId} onChange={setStudentId} />

            <FormField
              label="Razón (opcional)"
              placeholder="Ej. cita médica, permiso, sin justificar..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              style={{ minHeight: 76, textAlignVertical: 'top' }}
            />

            <Button label="Registrar falta" icon="checkmark-circle" onPress={handleSubmit} loading={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
