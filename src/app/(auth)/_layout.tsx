import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';

export default function AuthLayout() {
  const theme = useTheme();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary }}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (session) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
