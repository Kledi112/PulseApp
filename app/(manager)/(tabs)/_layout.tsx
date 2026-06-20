import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/theme';

export default function ManagerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors.teal,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
      }}>
      <Tabs.Screen
        name="team"
        options={{ title: 'Team', tabBarIcon: ({ color }) => <IconSymbol name="tray.full.fill" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="quest-management"
        options={{ title: 'Quests', tabBarIcon: ({ color }) => <IconSymbol name="trophy.fill" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} size={24} /> }}
      />
    </Tabs>
  );
}
