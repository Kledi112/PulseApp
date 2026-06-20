import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { declineRequest, getActiveRequests } from '@/services/requests';
import { Colors, Radii, Spacing } from '@/theme';
import { Request } from '@/types';
import { formatCurrency } from '@/utils/currency';

export default function ActiveRequestsScreen() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getActiveRequests().then((result) => {
      setRequests(result);
      setLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDecline = (id: string) => {
    Alert.alert('Decline request', 'Are you sure you want to decline this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          await declineRequest(id);
          load();
        },
      },
    ]);
  };

  const handleApprove = (request: Request) => {
    router.push({
      pathname: '/(manager)/payment',
      params: { requestId: request.id, amount: String(request.totalAll), employeeName: request.employeeName },
    });
  };

  if (!loading && requests.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl }}>
          <IconSymbol name="tray.full.fill" size={40} color={Colors.textTertiary} />
          <AppText variant="subtitle" style={{ textAlign: 'center' }}>
            No pending requests
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
            New employee requests will show up here.
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm }}>
        <AppText variant="title">Active requests</AppText>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="subtitle">{item.employeeName}</AppText>
              <View
                style={{
                  paddingHorizontal: Spacing.xs,
                  paddingVertical: 2,
                  borderRadius: Radii.pill,
                  backgroundColor: Colors.surfaceElevated,
                }}>
                <AppText variant="caption" color={Colors.textSecondary}>
                  {item.type === 'bundle' ? 'Bundle' : 'Single perk'}
                </AppText>
              </View>
            </View>

            <View style={{ marginTop: Spacing.sm, gap: Spacing.xxs }}>
              {item.items.map((requestItem) => (
                <AppText key={requestItem.perkId} variant="body" color={Colors.textSecondary} numberOfLines={1}>
                  {requestItem.title} · {requestItem.providerName}
                </AppText>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm }}>
              <AppText variant="subtitle" color={Colors.teal}>
                {formatCurrency(item.totalAll)}
              </AppText>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              <Button label="Decline" variant="secondary" onPress={() => handleDecline(item.id)} style={{ flex: 1 }} />
              <Button label="Approve" onPress={() => handleApprove(item)} style={{ flex: 1 }} />
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
