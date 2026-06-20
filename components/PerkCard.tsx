import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { AppText, Button, Card } from '@/components/ui';
import { Perk } from '@/types';
import { Colors, Radii, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';
import { strings } from '@/i18n/strings';

type PerkCardProps = {
  perk: Perk;
  onTake: (perk: Perk) => void;
  onAddToBundle: (perk: Perk) => void;
  isInBundle?: boolean;
};

export function PerkCard({ perk, onTake, onAddToBundle, isInBundle }: PerkCardProps) {
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <Image source={{ uri: perk.imageUri }} style={{ width: '100%', height: 140 }} contentFit="cover" />
      <View style={{ padding: Spacing.md, gap: Spacing.xs }}>
        <AppText variant="caption" color={Colors.textTertiary}>
          {perk.providerName}
        </AppText>
        <AppText variant="subtitle">{perk.title}</AppText>
        <AppText variant="body" color={Colors.textSecondary} numberOfLines={2}>
          {perk.description}
        </AppText>
        <AppText variant="subtitle" color={Colors.teal} style={{ marginTop: Spacing.xxs }}>
          {formatCurrency(perk.priceAll)}
        </AppText>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
          <Button label={strings.common.take} size="sm" onPress={() => onTake(perk)} style={{ flex: 1 }} />
          <Pressable
            onPress={() => onAddToBundle(perk)}
            disabled={isInBundle}
            style={{
              flex: 1,
              borderRadius: Radii.pill,
              borderWidth: 1,
              borderColor: isInBundle ? Colors.teal : Colors.borderStrong,
              backgroundColor: isInBundle ? Colors.surfaceElevated : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: Spacing.xs,
            }}>
            <AppText variant="label" color={isInBundle ? Colors.teal : Colors.textPrimary}>
              {isInBundle ? 'In bundle' : strings.common.addToBundle}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
