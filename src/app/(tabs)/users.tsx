import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { Badge, Button, Chip, EmptyState, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABEL, ROLE_ORDER, ROLE_TONE } from '@/lib/roles';
import { userService } from '@/services/userService';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';
import type { Profile, Role } from '@/types/database';

export default function UsersScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('maestro');

  const styles = useThemedStyles((t) => ({
    form: { margin: 16, padding: 16, backgroundColor: t.surface, borderRadius: radius.lg, ...cardShadow(t) },
    formTitle: { fontSize: 17, fontWeight: '800', color: t.text, marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '700', color: t.textMuted, marginBottom: 8, letterSpacing: 0.3 },
    chips: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    listContent: { paddingHorizontal: 16, paddingBottom: 32 },
    count: { fontSize: 13, fontWeight: '700', color: t.textMuted, marginHorizontal: 4, marginBottom: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      padding: 14,
      marginBottom: 8,
      ...cardShadow(t),
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: t.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 16, fontWeight: '800', color: t.primary },
    body: { flex: 1, gap: 2 },
    name: { fontSize: 15.5, fontWeight: '800', color: t.text },
    mail: { fontSize: 12.5, color: t.textMuted },
    badges: { flexDirection: 'row', gap: 6, marginTop: 4 },
    toggle: { padding: 8, borderRadius: radius.sm, backgroundColor: t.surfaceAlt },
  }));

  const load = useCallback(async () => {
    try {
      setUsers(await userService.list());
    } catch (error) {
      Alert.alert('Error', `No se pudo cargar la lista: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Falta información', 'Escribe nombre, correo y una contraseña de al menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await userService.createAccount({ full_name: fullName.trim(), email: email.trim(), password, role });
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('maestro');
      await load();
      Alert.alert('Cuenta creada', 'Entrégale el correo y la contraseña a la persona.');
    } catch (error) {
      Alert.alert('No se pudo crear la cuenta', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (profile: Profile) => {
    const next = !profile.active;
    Alert.alert(
      next ? 'Reactivar cuenta' : 'Desactivar cuenta',
      `${next ? 'Reactivar' : 'Desactivar'} a ${profile.full_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: next ? 'Reactivar' : 'Desactivar',
          style: next ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await userService.setActive(profile.id, next);
              await load();
            } catch (error) {
              Alert.alert('Error', (error as Error).message);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <FlatList
        data={loading ? [] : users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={[styles.form, { marginHorizontal: 0 }]}>
              <Text style={styles.formTitle}>Nueva cuenta</Text>
              <FormField label="Nombre completo" icon="person-outline" placeholder="Ej. Juan Pérez" value={fullName} onChangeText={setFullName} />
              <FormField
                label="Correo"
                icon="mail-outline"
                placeholder="maestro@escuela.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <FormField
                label="Contraseña inicial"
                icon="key-outline"
                placeholder="Mínimo 6 caracteres"
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <Text style={styles.label}>ROL</Text>
              <View style={styles.chips}>
                {ROLE_ORDER.map((r) => (
                  <Chip key={r} label={ROLE_LABEL[r]} active={role === r} onPress={() => setRole(r)} />
                ))}
              </View>
              <Button label="Crear cuenta" icon="person-add" onPress={handleCreate} loading={saving} />
            </View>
            {users.length ? <Text style={styles.count}>{users.length} CUENTAS</Text> : null}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 24 }} color={theme.primary} />
          ) : (
            <EmptyState icon="people-outline" title="Aún no hay cuentas" />
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.row, !item.active && { opacity: 0.55 }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.mail}>{item.email}</Text>
              <View style={styles.badges}>
                <Badge label={ROLE_LABEL[item.role]} tone={ROLE_TONE[item.role]} />
                {!item.active ? <Badge label="Desactivada" tone="danger" /> : null}
              </View>
            </View>
            {item.id !== user?.id ? (
              <Pressable style={styles.toggle} onPress={() => toggleActive(item)} accessibilityLabel="Activar o desactivar">
                <Ionicons name={item.active ? 'ban-outline' : 'refresh-outline'} size={18} color={theme.textMuted} />
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}
