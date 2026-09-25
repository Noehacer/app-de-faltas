import { useMemo } from 'react';
import { Platform, StyleSheet, useColorScheme } from 'react-native';

const light = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primarySoft: '#EEF2FF',
  onPrimary: '#FFFFFF',
  background: '#F5F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F7',
  border: '#E3E6F0',
  text: '#0F172A',
  textMuted: '#64748B',
  placeholder: '#94A3B8',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  success: '#059669',
  successSoft: '#D1FAE5',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  overlay: 'rgba(15,23,42,0.5)',
  shadow: '#1E1B4B',
};

const dark: typeof light = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primarySoft: '#25264A',
  onPrimary: '#0B0B1E',
  background: '#0B0D1A',
  surface: '#151830',
  surfaceAlt: '#1E2140',
  border: '#2A2E52',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  placeholder: '#64748B',
  danger: '#F87171',
  dangerSoft: '#3B1418',
  success: '#34D399',
  successSoft: '#0F2E25',
  warning: '#FBBF24',
  warningSoft: '#33260A',
  overlay: 'rgba(0,0,0,0.65)',
  shadow: '#000000',
};

export type Theme = typeof light & { scheme: 'light' | 'dark' };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(() => ({ ...(scheme === 'dark' ? dark : light), scheme }), [scheme]);
}

export function cardShadow(theme: Theme) {
  return Platform.select({
    web: { boxShadow: `0 2px 12px ${theme.scheme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(30,27,75,0.08)'}` },
    ios: {
      shadowColor: theme.shadow,
      shadowOpacity: theme.scheme === 'dark' ? 0.35 : 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    default: { elevation: 2 },
  }) as object;
}

export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (theme: Theme) => T
): T {
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
