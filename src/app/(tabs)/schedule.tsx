import { ActivityIndicator, ScrollView } from 'react-native';

import { ScheduleFilters } from '@/components/schedule/ScheduleFilters';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { SlotEditorPanel } from '@/components/schedule/SlotEditorPanel';
import { EmptyState, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useScheduleData } from '@/hooks/useScheduleData';
import { useTheme } from '@/theme';

export default function ScheduleScreen() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const data = useScheduleData();

  if (data.loading) {
    return (
      <Screen>
        <ActivityIndicator style={{ marginTop: 48 }} color={theme.primary} />
      </Screen>
    );
  }

  if (!data.groups.length) {
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
        <ScheduleFilters
          shift={data.shift}
          onShiftChange={data.setShift}
          groups={data.groups}
          group={data.group}
          onGroupChange={data.setGroup}
          weekStart={data.weekStart}
          onWeekStartChange={data.setWeekStart}
        />

        <ScheduleGrid
          shift={data.shift}
          shiftPeriods={data.shiftPeriods}
          weekStart={data.weekStart}
          group={data.group}
          selected={data.selected}
          onSelectCell={(weekday, periodId) => data.setSelected({ weekday, periodId })}
          slotByKey={data.slotByKey}
          subjectById={data.subjectById}
          teacherById={data.teacherById}
          absenceCount={data.absenceCount}
          totalAbsences={data.totalAbsences}
          isAdmin={isAdmin}
        />

        <SlotEditorPanel
          selected={data.selected}
          selectedDate={data.selectedDate}
          selectedPeriod={data.selectedPeriod}
          selectedSlot={data.selectedSlot}
          subjectById={data.subjectById}
          teacherById={data.teacherById}
          absenceCount={data.absenceCount}
          isAdmin={isAdmin}
          subjects={data.subjects}
          teachers={data.teachers}
          editSubject={data.editSubject}
          setEditSubject={data.setEditSubject}
          editTeacher={data.editTeacher}
          setEditTeacher={data.setEditTeacher}
          saving={data.saving}
          onSave={data.handleSave}
          onClear={data.handleClear}
          onReport={data.handleReport}
        />
      </ScrollView>
    </Screen>
  );
}
