import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, SectionList, View } from 'react-native';

import { AppText, Button, Card, Input, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ClaimedHistoryEntry, ManagedEmployee, getClaimedHistory, getManagedEmployees, setEmployeeBudget } from '@/services/manager';
import { Colors, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';

function formatDateHeading(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function groupByDate(entries: ClaimedHistoryEntry[]) {
  const groups = new Map<string, ClaimedHistoryEntry[]>();
  for (const entry of entries) {
    const key = formatDateHeading(entry.claimedAt);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

export default function TeamScreen() {
  const [employees, setEmployees] = useState<ManagedEmployee[]>([]);
  const [history, setHistory] = useState<ClaimedHistoryEntry[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getManagedEmployees(), getClaimedHistory()])
      .then(([emps, hist]) => {
        setEmployees(emps);
        setHistory(hist);
        setLoading(false);
      })
      .catch(() => {
        setEmployees([]);
        setHistory([]);
        setLoading(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSaveBudget = async (employee: ManagedEmployee) => {
    const raw = editing[employee.id];
    if (raw === undefined) return;
    const value = Math.round(Number(raw) * 100);
    if (Number.isNaN(value) || value < 0) {
      Alert.alert('Invalid amount', 'Enter a valid budget amount.');
      return;
    }
    try {
      await setEmployeeBudget(employee.id, value);
      setEditing((prev) => {
        const next = { ...prev };
        delete next[employee.id];
        return next;
      });
      load();
    } catch {
      Alert.alert('Could not update budget', 'Could not reach the backend. Check your connection and try again.');
    }
  };

  const sections = groupByDate(history);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="title">Team</AppText>
        <Button label="Invoice" size="sm" variant="secondary" onPress={() => router.push('/(manager)/invoice')} fullWidth={false} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
        renderSectionHeader={({ section }) => (
          <AppText variant="label" color={Colors.textSecondary} style={{ marginTop: Spacing.md, marginBottom: Spacing.xs }}>
            {section.title}
          </AppText>
        )}
        ListHeaderComponent={
          <View style={{ gap: Spacing.md, marginBottom: Spacing.lg }}>
            <AppText variant="subtitle">Monthly budgets</AppText>
            {!loading && employees.length === 0 ? (
              <AppText variant="body" color={Colors.textSecondary}>
                No employees yet.
              </AppText>
            ) : (
              employees.map((employee) => (
                <Card key={employee.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm }}>
                    <View style={{ flex: 1, gap: Spacing.xxs }}>
                      <AppText variant="label" numberOfLines={1}>
                        {employee.name}
                      </AppText>
                      <AppText variant="caption" color={Colors.textTertiary}>
                        Current: {formatCurrency(employee.monthlyBudgetAll)}
                      </AppText>
                    </View>
                    <View style={{ width: 100 }}>
                      <Input
                        label=""
                        keyboardType="decimal-pad"
                        placeholder={String(employee.monthlyBudgetAll / 100)}
                        value={editing[employee.id] ?? ''}
                        onChangeText={(text) => setEditing((prev) => ({ ...prev, [employee.id]: text }))}
                      />
                    </View>
                    <Button label="Save" size="sm" onPress={() => handleSaveBudget(employee)} fullWidth={false} />
                  </View>
                </Card>
              ))
            )}

            <AppText variant="subtitle" style={{ marginTop: Spacing.md }}>
              Claimed history
            </AppText>
            {!loading && history.length === 0 && (
              <AppText variant="body" color={Colors.textSecondary}>
                No perks claimed yet.
              </AppText>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, gap: Spacing.xxs }}>
                <AppText variant="label" numberOfLines={1}>
                  {item.title}
                </AppText>
                <AppText variant="caption" color={Colors.textTertiary}>
                  {item.employeeName} · {item.providerName}
                </AppText>
              </View>
              <AppText variant="label" color={Colors.teal}>
                {formatCurrency(item.priceAll)}
              </AppText>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          sections.length === 0 ? (
            <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl }}>
              <IconSymbol name="tray.full.fill" size={32} color={Colors.textTertiary} />
            </View>
          ) : null
        }
      />
    </Screen>
  );
}
