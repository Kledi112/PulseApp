import { Stack } from 'expo-router';

import { Colors } from '@/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register-business" options={{ headerShown: true, title: '', headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.textPrimary, headerShadowVisible: false }} />
      <Stack.Screen name="application-success" />
    </Stack>
  );
}
