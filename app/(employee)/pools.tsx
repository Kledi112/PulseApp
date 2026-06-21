import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';

import { PledgeModal } from '@/components/PledgeModal';
import { AppText, Button, Card, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { strings } from '@/i18n/strings';
import { cancelPool, getOpenPools, joinPool, PerkPool } from '@/services/perk-pools';
import { useAuthStore } from '@/store/auth-store';
import { Colors, Radii, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';

export default function PoolsScreen() {
  const [pools, setPools] = useState<PerkPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningPool, setJoiningPool] = useState<PerkPool | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);

  const load = useCallback(() => {
    setLoading(true);
    getOpenPools()
      .then((result) => {
        setPools(result);
        setLoading(false);
      })
      .catch(() => {
        setPools([]);
        setLoading(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleJoin = async (amountAll: number) => {
    if (!joiningPool) return;
    setSubmitting(true);
    try {
      await joinPool(joiningPool.id, amountAll);
      setJoiningPool(null);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach the backend. Check your connection and try again.';
      Alert.alert("Couldn't join pool", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (pool: PerkPool) => {
    Alert.alert(strings.pools.cancel, 'This releases everyone\'s pledge back to their budget.', [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.pools.cancel,
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelPool(pool.id);
            load();
          } catch {
            Alert.alert('Could not cancel pool', 'Could not reach the backend. Check your connection and try again.');
          }
        },
      },
    ]);
  };

  if (!loading && pools.length === 0) {
    return (
      <Screen>
        <View style={{ paddingTop: Spacing.sm }}>
          <AppText variant="title">{strings.pools.title}</AppText>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl }}>
          <IconSymbol name="person.2.fill" size={40} color={Colors.textTertiary} />
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            {strings.pools.empty}
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
            {strings.pools.subtitle}
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm }}>
        <AppText variant="title">{strings.pools.title}</AppText>
        <AppText variant="body" color={Colors.textSecondary} style={{ marginTop: Spacing.xxs }}>
          {strings.pools.subtitle}
        </AppText>
      </View>

      <FlatList
        data={pools}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}
        renderItem={({ item }) => {
          const isHost = item.hostEmployeeId === user?.id;
          const hasJoined = item.contributions.some((c) => c.employeeId === user?.id);
          const remaining = item.targetAmountAll - item.contributedAll;
          const progress = Math.min(1, item.contributedAll / item.targetAmountAll);

          return (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: Spacing.xxs }}>
                  <AppText variant="subtitle" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" color={Colors.textTertiary}>
                    {item.providerName} · {strings.pools.host} {item.hostName}
                  </AppText>
                </View>
                <AppText variant="label" color={Colors.teal}>
                  {formatCurrency(item.contributedAll)} / {formatCurrency(item.targetAmountAll)}
                </AppText>
              </View>

              <View style={{ marginTop: Spacing.sm, height: 6, borderRadius: 3, backgroundColor: Colors.surfaceElevated, overflow: 'hidden' }}>
                <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: Colors.teal }} />
              </View>

              <View style={{ marginTop: Spacing.sm, gap: Spacing.xxs }}>
                {item.contributions.map((c) => (
                  <AppText key={c.employeeId} variant="caption" color={Colors.textSecondary}>
                    {c.employeeName} · {formatCurrency(c.amountAll)}
                  </AppText>
                ))}
              </View>

              <View style={{ marginTop: Spacing.md }}>
                {isHost ? (
                  <Button label={strings.pools.cancel} variant="secondary" onPress={() => handleCancel(item)} />
                ) : hasJoined ? (
                  <View
                    style={{
                      paddingVertical: Spacing.xs,
                      borderRadius: Radii.pill,
                      alignItems: 'center',
                      backgroundColor: Colors.surfaceElevated,
                    }}>
                    <AppText variant="label" color={Colors.teal}>
                      {strings.pools.youreIn}
                    </AppText>
                  </View>
                ) : (
                  <Button label={`${strings.pools.join} · ${formatCurrency(remaining)} needed`} onPress={() => setJoiningPool(item)} />
                )}
              </View>
            </Card>
          );
        }}
      />

      <PledgeModal
        visible={joiningPool !== null}
        title={joiningPool ? `Join the pool for ${joiningPool.title}` : ''}
        subtitle={joiningPool ? `${formatCurrency(joiningPool.targetAmountAll - joiningPool.contributedAll)} still needed to unlock it` : undefined}
        maxAmountAll={joiningPool ? joiningPool.targetAmountAll - joiningPool.contributedAll : 0}
        submitLabel={strings.pools.join}
        submitting={submitting}
        onSubmit={handleJoin}
        onClose={() => setJoiningPool(null)}
      />
    </Screen>
  );
}
