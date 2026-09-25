import { Text, View } from 'react-native';

import { Badge, Button, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABEL, ROLE_TONE } from '@/lib/roles';
import { cardShadow, radius, useThemedStyles } from '@/theme';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const name = profile?.full_name ?? user?.email ?? '';

  const styles = useThemedStyles((t) => ({
    container: { padding: 16 },
    card: {
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 24,
      marginBottom: 16,
      ...cardShadow(t),
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: t.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    avatarText: { fontSize: 34, fontWeight: '900', color: t.onPrimary },
    name: { fontSize: 20, fontWeight: '800', color: t.text, marginBottom: 2 },
    email: { fontSize: 14, color: t.textMuted, marginBottom: 12 },
  }));

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {profile ? <Badge label={ROLE_LABEL[profile.role]} tone={ROLE_TONE[profile.role]} /> : null}
        </View>
        <Button label="Cerrar sesión" icon="log-out-outline" variant="danger" onPress={signOut} />
      </View>
    </Screen>
  );
}
