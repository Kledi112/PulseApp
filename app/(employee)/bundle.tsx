import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { strings } from '@/i18n/strings';
import { submitRequest } from '@/services';
import { useAuthStore } from '@/store/auth-store';
import { useBundleStore } from '@/store/bundle-store';
import { Colors, Radii, Spacing } from '@/theme';
import { computeBundlePricing } from '@/utils/bundle';
import { formatCurrency } from '@/utils/currency';

export default function BundleScreen() {
  const items = useBundleStore((state) => state.items);
  const removePerk = useBundleStore((state) => state.removePerk);
  const clear = useBundleStore((state) => state.clear);
  const user = useAuthStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);

  const { items: requestItems, totalAll, discountApplied } = computeBundlePricing(items);

  const handleRequestBundle = async () => {
    if (!user || items.length === 0) return;
    setSubmitting(true);
    try {
      await submitRequest({
        employeeId: user.id,
        employeeName: user.name,
        type: 'bundle',
        items: requestItems,
        totalAll,
      });
      clear();
      Alert.alert(strings.marketplace.requestSent, strings.marketplace.requestSentBody);
    } catch {
      Alert.alert('Request failed', 'Could not reach the backend. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl }}>
          <IconSymbol name="bag.fill" size={40} color={Colors.textTertiary} />
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            {strings.bundle.emptyTitle}
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
            {strings.bundle.emptyBody}
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm }}>
        <AppText variant="title">{strings.bundle.title}</AppText>
        <View
          style={{
            marginTop: Spacing.sm,
            paddingVertical: Spacing.xs,
            paddingHorizontal: Spacing.md,
            borderRadius: Radii.md,
            backgroundColor: discountApplied ? Colors.surfaceElevated : Colors.surface,
            borderWidth: 1,
            borderColor: discountApplied ? Colors.teal : Colors.border,
          }}>
          <AppText variant="label" color={discountApplied ? Colors.teal : Colors.textSecondary}>
            {discountApplied ? strings.bundle.discountActive : strings.bundle.discountHint}
          </AppText>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
        renderItem={({ item, index }) => {
          const requestItem = requestItems[index];
          return (
            <Card>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <Image source={{ uri: item.imageUri }} style={{ width: 64, height: 64, borderRadius: Radii.sm }} contentFit="cover" />
                <View style={{ flex: 1, gap: Spacing.xxs }}>
                  <AppText variant="label" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" color={Colors.textTertiary}>
                    {item.providerName}
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'baseline' }}>
                    {discountApplied && (
                      <AppText variant="caption" color={Colors.textTertiary} style={{ textDecorationLine: 'line-through' }}>
                        {formatCurrency(requestItem.originalPriceAll)}
                      </AppText>
                    )}
                    <AppText variant="label" color={Colors.teal}>
                      {formatCurrency(requestItem.discountedPriceAll)}
                    </AppText>
                  </View>
                </View>
                <Pressable onPress={() => removePerk(item.id)} style={{ padding: Spacing.xxs }}>
                  <IconSymbol name="xmark.circle.fill" size={22} color={Colors.textTertiary} />
                </Pressable>
              </View>
            </Card>
          );
        }}
        ListFooterComponent={
          <View style={{ marginTop: Spacing.sm, gap: Spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="subtitle">{strings.bundle.total}</AppText>
              <AppText variant="subtitle" color={Colors.teal}>
                {formatCurrency(totalAll)}
              </AppText>
            </View>
            <Button label={strings.bundle.requestBundle} onPress={handleRequestBundle} loading={submitting} />
          </View>
        }
      />
    </Screen>
  );
}
