import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cardShadow, radius, useTheme, useThemedStyles } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const styles = useThemedStyles((t) => ({
    container: { flex: 1, backgroundColor: t.primary },
    scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    brand: { alignItems: 'center', marginBottom: 28 },
    logo: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    title: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
    tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: t.surface,
      borderRadius: 24,
      padding: 24,
      ...cardShadow(t),
    },
    heading: { fontSize: 20, fontWeight: '800', color: t.text, marginBottom: 4 },
    sub: { fontSize: 14, color: t.textMuted, marginBottom: 20 },
    error: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      backgroundColor: t.dangerSoft,
      padding: 12,
      borderRadius: radius.md,
      marginBottom: 14,
    },
    errorText: { color: t.danger, fontSize: 13.5, fontWeight: '600', flex: 1 },
    hint: { fontSize: 12.5, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 20, maxWidth: 360 },
  }));

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) setError(signInError);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="school" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Control de Faltas</Text>
          <Text style={styles.tagline}>Asistencia escolar, simple y en la nube</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Bienvenido</Text>
          <Text style={styles.sub}>Inicia sesión con tu cuenta escolar</Text>

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
            label="Contraseña"
            icon="lock-closed-outline"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleSubmit}
          />

          {error ? (
            <View style={styles.error}>
              <Ionicons name="alert-circle" size={18} color={theme.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button label="Entrar" icon="log-in-outline" onPress={handleSubmit} loading={loading} />
        </View>

        <Text style={styles.hint}>¿No tienes cuenta? Pídesela al encargado de tu escuela.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
