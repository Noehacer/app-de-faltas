import { Stack } from 'expo-router';

export default function CatalogsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Catálogos' }} />
      <Stack.Screen name="teachers" options={{ title: 'Maestros' }} />
      <Stack.Screen name="subjects" options={{ title: 'Materias' }} />
      <Stack.Screen name="students" options={{ title: 'Alumnos' }} />
      <Stack.Screen name="periods" options={{ title: 'Horarios' }} />
    </Stack>
  );
}
