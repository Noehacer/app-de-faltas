import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormField } from '@/components/FormField';
import { SelectField, type SelectOption } from '@/components/SelectField';
import { attendanceService } from '@/services/attendanceService';
import { catalogService } from '@/services/catalogService';
import type { ClassPeriod, Student, Subject, Teacher } from '@/types/database';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIso(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export default function NewRecordScreen() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const [occurredOn, setOccurredOn] = useState(todayIso());
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

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
    () => periods.map((p) => ({ id: p.id, label: p.label })),
    [periods]
  );
  const subjectOptions: SelectOption[] = useMemo(
    () => subjects.map((s) => ({ id: s.id, label: s.name })),
    [subjects]
  );
  const teacherOptions: SelectOption[] = useMemo(
    () => teachers.map((t) => ({ id: t.id, label: t.full_name })),
    [teachers]
  );
  const studentOptions: SelectOption[] = useMemo(
    () => students.map((s) => ({ id: s.id, label: s.full_name })),
    [students]
  );

  const resetForm = () => {
    setPeriodId(null);
    setSubjectId(null);
    setTeacherId(null);
    setStudentId(null);
    setReason('');
    setOccurredOn(todayIso());
  };

  const handleSubmit = async () => {
    if (!periodId || !subjectId || !teacherId || !studentId) {
      Alert.alert('Falta información', 'Selecciona hora, materia, maestro y alumno.');
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
    !loadingCatalogs &&
    (periods.length === 0 || subjects.length === 0 || teachers.length === 0 || students.length === 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {catalogsEmpty ? (
          <Text style={styles.warning}>
            Falta cargar maestros, materias, alumnos u horarios en la pestaña Catálogos antes de
            registrar una falta.
          </Text>
        ) : null}

        <Text style={styles.label}>Fecha</Text>
        <View style={styles.dateRow}>
          <Pressable
            style={[styles.dateChip, occurredOn === todayIso() && styles.dateChipActive]}
            onPress={() => setOccurredOn(todayIso())}
          >
            <Text
              style={[styles.dateChipText, occurredOn === todayIso() && styles.dateChipTextActive]}
            >
              Hoy
            </Text>
          </Pressable>
          <Pressable
            style={[styles.dateChip, occurredOn === yesterdayIso() && styles.dateChipActive]}
            onPress={() => setOccurredOn(yesterdayIso())}
          >
            <Text
              style={[
                styles.dateChipText,
                occurredOn === yesterdayIso() && styles.dateChipTextActive,
              ]}
            >
              Ayer
            </Text>
          </Pressable>
        </View>
        <FormField
          label="Fecha (AAAA-MM-DD)"
          value={occurredOn}
          onChangeText={setOccurredOn}
          placeholder="2026-09-23"
        />

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
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.submitButtonText}>
            {saving ? 'Guardando...' : 'Registrar falta'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  warning: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  dateChipActive: {
    backgroundColor: '#2563EB',
  },
  dateChipText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
