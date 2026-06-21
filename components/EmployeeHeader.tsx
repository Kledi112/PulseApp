import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { PulseIcon } from '@/components/ui/PulseIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { strings } from '@/i18n/strings';
import { Colors, Spacing } from '@/theme';

export function EmployeeHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: Spacing.lg,
        paddingTop: insets.top + Spacing.xs,
        paddingBottom: Spacing.sm,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <PulseIcon size={32} />
        <AppText variant="title" color={Colors.teal} style={{ marginLeft: Spacing.sm }}>
          {strings.marketplace.title}
        </AppText>
      </View>

      <Pressable
        onPress={() => router.push('/(employee)/profile')}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: Colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconSymbol name="person.fill" size={18} color={Colors.textPrimary} />
      </Pressable>
    </View>
  );
}
