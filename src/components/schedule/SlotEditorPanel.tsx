import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { SelectField } from '@/components/SelectField';
import { Button } from '@/components/ui';
import type { ScheduleSelection } from '@/hooks/useScheduleData';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';
import type { ClassPeriod, ScheduleSlot, Subject, Teacher } from '@/types/database';

const DAYS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

type SlotEditorPanelProps = {
  selected: ScheduleSelection | null;
  selectedDate: Date | null;
  selectedPeriod: ClassPeriod | undefined;
  selectedSlot: ScheduleSlot | undefined;
  subjectById: Map<string, Subject>;
  teacherById: Map<string, Teacher>;
  absenceCount: Map<string, number>;
  isAdmin: boolean;
  subjects: Subject[];
  teachers: Teacher[];
  editSubject: string | null;
  setEditSubject: (id: string) => void;
  editTeacher: string | null;
  setEditTeacher: (id: string) => void;
  saving: boolean;
  onSave: () => void;
  onClear: () => void;
  onReport: () => void;
};

export function SlotEditorPanel({
  selected,
  selectedDate,
  selectedPeriod,
  selectedSlot,
  subjectById,
  teacherById,
  absenceCount,
  isAdmin,
  subjects,
  teachers,
  editSubject,
  setEditSubject,
  editTeacher,
  setEditTeacher,
  saving,
  onSave,
  onClear,
  onReport,
}: SlotEditorPanelProps) {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    panel: { margin: 16, padding: 16, backgroundColor: t.surface, borderRadius: radius.lg, gap: 12, ...cardShadow(t) },
    panelTitle: { fontSize: 17, fontWeight: '900', color: t.text },
    panelLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    panelText: { fontSize: 14, color: t.textMuted, flexShrink: 1 },
    hint: { fontSize: 13, color: t.textMuted, textAlign: 'center', marginHorizontal: 16, marginTop: 12 },
  }));

  if (!selected || !selectedDate || !selectedPeriod) {
    return (
      <Text style={styles.hint}>
        {isAdmin ? 'Toca una celda para editarla o reportar una falta.' : 'Toca una celda para reportar una falta.'}
      </Text>
    );
  }

  return (
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

      <Button label="Reportar falta aquí" icon="flag" onPress={onReport} />

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
          <Button label="Guardar en el horario" icon="save" variant="secondary" onPress={onSave} loading={saving} />
          {selectedSlot ? <Button label="Quitar clase" icon="trash-outline" variant="danger" onPress={onClear} /> : null}
        </>
      ) : null}
    </View>
  );
}
