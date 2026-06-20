import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { strings } from '@/i18n/strings';
import { Colors, Spacing } from '@/theme';

export default function ApplicationSuccessScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg }}>
        <LinearGradient
          colors={Colors.gradient.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name="checkmark.circle.fill" size={40} color={Colors.background} />
        </LinearGradient>
        <View style={{ alignItems: 'center', gap: Spacing.xs }}>
          <AppText variant="title">{strings.applicationSuccess.title}</AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', maxWidth: 280 }}>
            {strings.applicationSuccess.subtitle}
          </AppText>
        </View>
        <Button
          label={strings.applicationSuccess.cta}
          fullWidth={false}
          style={{ paddingHorizontal: Spacing.xxl }}
          onPress={() => router.replace('/(auth)/login')}
        />
      </View>
    </Screen>
  );
}
