import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, type ColorValue, Text, View } from 'react-native';

import { Button, EmptyState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, useThemedStyles } from '@/theme';

function NoAccess() {
  const { signOut, user } = useAuth();
  const styles = useThemedStyles((t) => ({
    wrap: { flex: 1, backgroundColor: t.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
    email: { color: t.textMuted, fontSize: 13, marginBottom: 20 },
  }));
  return (
    <View style={styles.wrap}>
      <EmptyState
        icon="lock-closed"
        title="Tu cuenta no tiene acceso"
        hint="El encargado debe darte de alta o reactivar tu cuenta."
      />
      <Text style={styles.email}>{user?.email}</Text>
      <Button label="Cerrar sesión" icon="log-out-outline" variant="secondary" onPress={signOut} />
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const { session, profile, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!profile) return <NoAccess />;

  const icon = (focused: string, idle: string) => {
    function TabIcon({ color, size, focused: f }: { color: ColorValue; size: number; focused: boolean }) {
      return <Ionicons name={(f ? focused : idle) as never} size={size} color={color} />;
    }
    return TabIcon;
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { color: theme.text, fontWeight: '800' },
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.placeholder,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Faltas', tabBarIcon: icon('list', 'list-outline') }} />
      <Tabs.Screen name="new-record" options={{ title: 'Nueva falta', tabBarIcon: icon('add-circle', 'add-circle-outline') }} />
      <Tabs.Screen name="schedule" options={{ title: 'Horario', tabBarIcon: icon('calendar', 'calendar-outline') }} />
      <Tabs.Screen
        name="catalogs"
        options={{ title: 'Catálogos', headerShown: false, href: isAdmin ? undefined : null, tabBarIcon: icon('albums', 'albums-outline') }}
      />
      <Tabs.Screen
        name="users"
        options={{ title: 'Usuarios', href: isAdmin ? undefined : null, tabBarIcon: icon('people', 'people-outline') }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
