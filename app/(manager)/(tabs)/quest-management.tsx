import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { getEntriesForQuest, getQuests, selectQuestWinner } from '@/services/quests';
import { Colors, Radii, Spacing } from '@/theme';
import { Quest, QuestEntry } from '@/types';

export default function QuestManagementScreen() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [entriesByQuest, setEntriesByQuest] = useState<Record<string, QuestEntry[]>>({});
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getQuests();
    setQuests(result);
    const awaiting = result.filter((quest) => quest.status === 'awaiting_winner');
    const entries = await Promise.all(awaiting.map((quest) => getEntriesForQuest(quest.id)));
    const map: Record<string, QuestEntry[]> = {};
    awaiting.forEach((quest, index) => {
      map[quest.id] = entries[index];
    });
    setEntriesByQuest(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSelectWinner = async (questId: string, entry: QuestEntry) => {
    await selectQuestWinner(questId, entry.participantId, entry.participantName);
    setExpandedQuestId(null);
    load();
  };

  const awaitingWinner = quests.filter((quest) => quest.status === 'awaiting_winner');
  const active = quests.filter((quest) => quest.status === 'active');

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="title">Quest management</AppText>
        <Button label="New quest" size="sm" fullWidth={false} onPress={() => router.push('/(manager)/create-quest')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: Spacing.md }}>
          {awaitingWinner.length > 0 && (
              <View style={{ gap: Spacing.sm }}>
                <AppText variant="subtitle">Awaiting a winner</AppText>
                {awaitingWinner.map((quest) => (
                  <Card key={quest.id}>
                    <AppText variant="label">{quest.title}</AppText>
                    <AppText variant="body" color={Colors.textSecondary} style={{ marginTop: Spacing.xxs }}>
                      {quest.reward}
                    </AppText>
                    <Pressable
                      onPress={() => setExpandedQuestId(expandedQuestId === quest.id ? null : quest.id)}
                      style={{ marginTop: Spacing.sm }}>
                      <AppText variant="label" color={Colors.teal}>
                        {expandedQuestId === quest.id ? 'Hide entries' : 'Select winner'}
                      </AppText>
                    </Pressable>
                    {expandedQuestId === quest.id && (
                      <View style={{ marginTop: Spacing.sm, gap: Spacing.xs }}>
                        {(entriesByQuest[quest.id] ?? []).map((entry) => (
                          <Pressable
                            key={entry.id}
                            onPress={() => handleSelectWinner(quest.id, entry)}
                            style={{
                              paddingVertical: Spacing.sm,
                              paddingHorizontal: Spacing.md,
                              borderRadius: Radii.md,
                              backgroundColor: Colors.surfaceElevated,
                              borderWidth: 1,
                              borderColor: Colors.border,
                            }}>
                            <AppText variant="body">{entry.participantName}</AppText>
                          </Pressable>
                        ))}
                        {(entriesByQuest[quest.id] ?? []).length === 0 && (
                          <AppText variant="body" color={Colors.textSecondary}>
                            No entries yet for this quest.
                          </AppText>
                        )}
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            )}

            <View style={{ gap: Spacing.sm }}>
              <AppText variant="subtitle">Active quests</AppText>
              {active.map((quest) => (
                <Card key={quest.id}>
                  <AppText variant="label">{quest.title}</AppText>
                  <AppText variant="body" color={Colors.textSecondary} style={{ marginTop: Spacing.xxs }} numberOfLines={2}>
                    {quest.description}
                  </AppText>
                  <AppText variant="caption" color={Colors.textTertiary} style={{ marginTop: Spacing.xs }}>
                    Deadline {quest.deadline}
                  </AppText>
                </Card>
              ))}
            </View>
          </View>
      </ScrollView>
    </Screen>
  );
}
