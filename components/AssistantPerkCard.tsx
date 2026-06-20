import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { Perk } from '@/types';
import { Colors, Radii, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';

export function AssistantPerkCard({ perk, onAddToBundle, added }: { perk: Perk; onAddToBundle: (perk: Perk) => void; added: boolean }) {
  return (
    <Card padded={false} style={{ width: 180, overflow: 'hidden' }}>
      <Image source={{ uri: perk.imageUri }} style={{ width: '100%', height: 90 }} contentFit="cover" />
      <View style={{ padding: Spacing.sm, gap: Spacing.xxs }}>
        <AppText variant="label" numberOfLines={1}>
          {perk.title}
        </AppText>
        <AppText variant="caption" color={Colors.textTertiary} numberOfLines={1}>
          {perk.providerName}
        </AppText>
        <AppText variant="label" color={Colors.teal}>
          {formatCurrency(perk.priceAll)}
        </AppText>
        <Pressable
          onPress={() => onAddToBundle(perk)}
          disabled={added}
          style={{
            marginTop: Spacing.xxs,
            paddingVertical: Spacing.xxs,
            borderRadius: Radii.pill,
            alignItems: 'center',
            backgroundColor: added ? Colors.surfaceElevated : Colors.teal,
          }}>
          <AppText variant="caption" color={added ? Colors.teal : Colors.background}>
            {added ? 'In bundle' : 'Add to bundle'}
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}
