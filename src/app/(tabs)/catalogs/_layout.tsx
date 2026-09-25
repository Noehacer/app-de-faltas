import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function CatalogsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { color: theme.text, fontWeight: '800' },
        headerTintColor: theme.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Catálogos' }} />
      <Stack.Screen name="teachers" options={{ title: 'Maestros' }} />
      <Stack.Screen name="subjects" options={{ title: 'Materias' }} />
      <Stack.Screen name="students" options={{ title: 'Alumnos' }} />
      <Stack.Screen name="periods" options={{ title: 'Horarios' }} />
    </Stack>
  );
}
