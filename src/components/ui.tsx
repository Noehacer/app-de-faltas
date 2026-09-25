import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';

import { radius, space, useTheme, useThemedStyles } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, icon, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
      paddingVertical: 14,
      paddingHorizontal: space.xl,
      borderRadius: radius.md,
    },
    primary: { backgroundColor: t.primary },
    secondary: { backgroundColor: t.primarySoft },
    danger: { backgroundColor: t.dangerSoft },
    ghost: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.55 },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    text: { fontSize: 15, fontWeight: '700' },
  }));

  const color =
    variant === 'primary' ? theme.onPrimary : variant === 'danger' ? theme.danger : theme.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : icon ? (
        <Ionicons name={icon} size={18} color={color} />
      ) : null}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const styles = useThemedStyles((t) => ({
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
    },
    active: { backgroundColor: t.primary, borderColor: t.primary },
    text: { fontSize: 13, fontWeight: '600', color: t.textMuted },
    textActive: { color: t.onPrimary },
  }));
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ icon, title, hint }: { icon: IconName; title: string; hint?: string }) {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    wrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: space.xl },
    circle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: t.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: space.lg,
    },
    title: { fontSize: 16, fontWeight: '700', color: t.text, textAlign: 'center' },
    hint: { fontSize: 13, color: t.textMuted, textAlign: 'center', marginTop: 4 },
  }));
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={32} color={theme.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Screen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const styles = useThemedStyles((t) => ({
    outer: { flex: 1, backgroundColor: t.background, alignItems: 'center' },
    inner: { flex: 1, width: '100%', maxWidth: 760 },
  }));
  return (
    <View style={styles.outer}>
      <View style={[styles.inner, style]}>{children}</View>
    </View>
  );
}

export function Badge({ label, tone }: { label: string; tone: 'primary' | 'success' | 'warning' | 'danger' }) {
  const t = useTheme();
  const palette = {
    primary: { bg: t.primarySoft, fg: t.primary },
    success: { bg: t.successSoft, fg: t.success },
    warning: { bg: t.warningSoft, fg: t.warning },
    danger: { bg: t.dangerSoft, fg: t.danger },
  };
  const c = palette[tone];
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: c.fg, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
