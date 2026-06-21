import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, View } from 'react-native';

import { PerkCard } from '@/components/PerkCard';
import { PledgeModal } from '@/components/PledgeModal';
import { AppText, CategoryChip, Screen } from '@/components/ui';
import { strings } from '@/i18n/strings';
import { getPerksByCategory, takePerk } from '@/services';
import { createPool } from '@/services/perk-pools';
import { getSavedPerks, savePerk, unsavePerk } from '@/services/saved-perks';
import { useAuthStore } from '@/store/auth-store';
import { useBundleStore } from '@/store/bundle-store';
import { Colors, Spacing } from '@/theme';
import { CATEGORIES, Category, Perk } from '@/types';

type CategoryFilter = Category | 'all';

export default function MarketplaceScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [poolingPerk, setPoolingPerk] = useState<Perk | null>(null);
  const [creatingPool, setCreatingPool] = useState(false);

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

  useEffect(() => {
    getSavedPerks()
      .then((result) => setSavedIds(new Set(result.map((perk) => perk.id))))
      .catch(() => setSavedIds(new Set()));
  }, []);

  const handleToggleSave = async (perk: Perk) => {
    const isSaved = savedIds.has(perk.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(perk.id);
      else next.add(perk.id);
      return next;
    });
    try {
      if (isSaved) await unsavePerk(perk.id);
      else await savePerk(perk.id);
    } catch {
      // Revert on failure - the optimistic toggle above didn't stick.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(perk.id);
        else next.delete(perk.id);
        return next;
      });
    }
  };

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

  const handleCreatePool = async (amountAll: number) => {
    if (!poolingPerk) return;
    setCreatingPool(true);
    try {
      await createPool(poolingPerk.id, amountAll);
      setPoolingPerk(null);
      Alert.alert(strings.pools.startPool, 'Your pool is live - find it under the Pools tab.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach the backend. Check your connection and try again.';
      Alert.alert("Couldn't start pool", message);
    } finally {
      setCreatingPool(false);
    }
  };

  return (
    <Screen padded={false}>
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
              isSaved={savedIds.has(item.id)}
              onToggleSave={handleToggleSave}
              onPool={setPoolingPerk}
            />
          )}
        />
      )}

      <PledgeModal
        visible={poolingPerk !== null}
        title={poolingPerk ? `Start a pool for ${poolingPerk.title}` : ''}
        subtitle={strings.pools.startPoolSubtitle}
        maxAmountAll={poolingPerk?.priceAll ?? 0}
        submitLabel={strings.pools.startPool}
        submitting={creatingPool}
        onSubmit={handleCreatePool}
        onClose={() => setPoolingPerk(null)}
      />
    </Screen>
  );
}
