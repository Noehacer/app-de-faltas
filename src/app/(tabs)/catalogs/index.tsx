import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/ui';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const MENU: { href: string; label: string; description: string; icon: IconName }[] = [
  { href: '/(tabs)/catalogs/teachers', label: 'Maestros', description: 'Quienes imparten las clases', icon: 'person' },
  { href: '/(tabs)/catalogs/subjects', label: 'Materias', description: 'Materias y clases disponibles', icon: 'book' },
  { href: '/(tabs)/catalogs/students', label: 'Alumnos', description: 'Alumnos con su grado y grupo', icon: 'school' },
  { href: '/(tabs)/catalogs/periods', label: 'Horarios', description: 'Horas o periodos de clase', icon: 'time' },
];

export default function CatalogsMenu() {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    container: { padding: 16, gap: 12 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 16,
      ...cardShadow(t),
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: t.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1 },
    title: { fontSize: 17, fontWeight: '800', color: t.text },
    description: { fontSize: 13, color: t.textMuted, marginTop: 2 },
  }));

  return (
    <Screen>
      <View style={styles.container}>
        {MENU.map((item) => (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable style={styles.card}>
              <View style={styles.icon}>
                <Ionicons name={item.icon} size={24} color={theme.primary} />
              </View>
              <View style={styles.body}>
                <Text style={styles.title}>{item.label}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
