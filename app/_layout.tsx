import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ConnectionErrorModal } from '@/components/ConnectionErrorModal';
import { GlobalLoadingOverlay } from '@/components/GlobalLoadingOverlay';
import { Colors } from '@/theme';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(employee)" />
        <Stack.Screen name="(manager)" />
      </Stack>
      <StatusBar style="light" />
      <ConnectionErrorModal />
      <GlobalLoadingOverlay />
    </ThemeProvider>
  );
}
