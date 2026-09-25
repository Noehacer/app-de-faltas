import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { radius, useTheme, useThemedStyles } from '@/theme';

type FormFieldProps = TextInputProps & {
  label?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function FormField({ label, icon, style, ...inputProps }: FormFieldProps) {
  const theme = useTheme();
  const styles = useThemedStyles((t) => ({
    container: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '700', color: t.textMuted, marginBottom: 6, letterSpacing: 0.3 },
    box: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      backgroundColor: t.surface,
    },
    input: { flex: 1, paddingVertical: 13, fontSize: 16, color: t.text, outlineStyle: 'none' } as never,
  }));

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.box}>
        {icon ? <Ionicons name={icon} size={18} color={theme.placeholder} /> : null}
        <TextInput style={[styles.input, style]} placeholderTextColor={theme.placeholder} {...inputProps} />
      </View>
    </View>
  );
}
