import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, View } from 'react-native';

import { PulseIcon } from '@/components/ui/PulseIcon';
import { PerkCard } from '@/components/PerkCard';
import { AppText, CategoryChip, Screen } from '@/components/ui';
import { strings } from '@/i18n/strings';
import { getPerksByCategory, takePerk } from '@/services';
import { useAuthStore } from '@/store/auth-store';
import { useBundleStore } from '@/store/bundle-store';
import { Colors, Spacing } from '@/theme';
import { CATEGORIES, Category, Perk } from '@/types';

type CategoryFilter = Category | 'all';

export default function MarketplaceScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const bundleItems = useBundleStore((state) => state.items);
  const addPerk = useBundleStore((state) => state.addPerk);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPerksByCategory(selectedCategory)
      .then((result) => {
        if (active) {
          setPerks(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setPerks([]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedCategory]);

  const handleTake = async (perk: Perk) => {
    if (!user) return;
    try {
      await takePerk(perk.id);
      Alert.alert(strings.marketplace.perkTaken, strings.marketplace.perkTakenBody);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach the backend. Check your connection and try again.';
      Alert.alert(strings.marketplace.takeFailed, message);
    }
  };

  return (
    <Screen padded={false}>
      <View style={{  flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm, }}>
        <PulseIcon size={32} />
        <AppText variant="title" color={Colors.teal} style={{marginLeft: Spacing.sm}}>{strings.marketplace.title}</AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{  alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,  }}>
        <CategoryChip label={strings.marketplace.allCategory} selected={selectedCategory === 'all'} onPress={() => setSelectedCategory('all')} />
        {CATEGORIES.map((category) => (
          <CategoryChip
            key={category.key}
            label={category.label}
            selected={selectedCategory === category.key}
            onPress={() => setSelectedCategory(category.key)}
          />
        ))}
      </ScrollView>

      {loading ? null : perks.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl }}>
          <AppText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
            No perks in this category yet.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={perks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          renderItem={({ item }) => (
            <PerkCard
              perk={item}
              onTake={handleTake}
              onAddToBundle={addPerk}
              isInBundle={bundleItems.some((bundleItem) => bundleItem.id === item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
}
