import { Stack } from 'expo-router';

import { Colors } from '@/theme';

export default function ManagerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="payment" options={{ presentation: 'modal', headerShown: true, title: 'Payment', headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.textPrimary, headerShadowVisible: false }} />
      <Stack.Screen name="create-quest" options={{ presentation: 'modal', headerShown: true, title: 'New quest', headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.textPrimary, headerShadowVisible: false }} />
    </Stack>
  );
}
