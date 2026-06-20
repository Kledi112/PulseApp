import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBundleStore } from '@/store/bundle-store';
import { Colors } from '@/theme';

export default function EmployeeTabLayout() {
  const bundleCount = useBundleStore((state) => state.items.length);

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
        name="marketplace"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="bundle"
        options={{
          title: 'Bundle',
          tabBarIcon: ({ color }) => <IconSymbol name="bag.fill" color={color} size={24} />,
          tabBarBadge: bundleCount > 0 ? bundleCount : undefined,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{ title: 'Quests', tabBarIcon: ({ color }) => <IconSymbol name="flag.fill" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="assistant"
        options={{ title: 'Assistant', tabBarIcon: ({ color }) => <IconSymbol name="message.fill" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} size={24} /> }}
      />
    </Tabs>
  );
}
