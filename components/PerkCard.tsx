import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { AppText, Button, Card } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Perk } from '@/types';
import { Colors, Radii, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';
import { strings } from '@/i18n/strings';

type PerkCardProps = {
  perk: Perk;
  onTake: (perk: Perk) => void;
  onAddToBundle: (perk: Perk) => void;
  isInBundle?: boolean;
  isSaved?: boolean;
  onToggleSave?: (perk: Perk) => void;
  onPool?: (perk: Perk) => void;
};

export function PerkCard({ perk, onTake, onAddToBundle, isInBundle, isSaved, onToggleSave, onPool }: PerkCardProps) {
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <View>
        <Image source={{ uri: perk.imageUri }} style={{ width: '100%', height: 140 }} contentFit="cover" />
        {onToggleSave && (
          <Pressable
            onPress={() => onToggleSave(perk)}
            style={{
              position: 'absolute',
              top: Spacing.xs,
              right: Spacing.xs,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(13,17,23,0.55)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconSymbol name="star.fill" size={16} color={isSaved ? Colors.teal : Colors.textPrimary} />
          </Pressable>
        )}
      </View>
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
        {onPool && (
          <Pressable
            onPress={() => onPool(perk)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.xxs,
              marginTop: Spacing.xs,
              paddingVertical: Spacing.xxs,
            }}>
            <IconSymbol name="person.2.fill" size={14} color={Colors.textSecondary} />
            <AppText variant="caption" color={Colors.textSecondary}>
              {strings.common.poolWithOthers}
            </AppText>
          </Pressable>
        )}
      </View>
    </Card>
  );
}
