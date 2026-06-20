import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { EnterQuestButton } from '@/components/EnterQuestButton';
import { AppText, Card, Screen } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { enterQuest, getLeaderboard, getQuests } from '@/services/quests';
import { useAuthStore } from '@/store/auth-store';
import { Colors, Radii, Spacing } from '@/theme';
import { LeaderboardEntry, Quest, QuestEntryMode } from '@/types';

const TYPE_LABEL: Record<Quest['type'], string> = {
  team: 'Team quest',
  individual: 'Individual quest',
  either: 'Team or individual',
};

export default function QuestsScreen() {
  const user = useAuthStore((state) => state.user);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [enteredQuestIds, setEnteredQuestIds] = useState<Set<string>>(new Set());
  const [submittingQuestId, setSubmittingQuestId] = useState<string | null>(null);
  const [modeByQuest, setModeByQuest] = useState<Record<string, QuestEntryMode>>({});

  useEffect(() => {
    getQuests()
      .then((result) => setQuests(result.filter((quest) => quest.status === 'active')))
      .catch(() => setQuests([]));
    getLeaderboard()
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]));
  }, []);

  const handleEnter = async (quest: Quest) => {
    if (!user) return;
    const mode: QuestEntryMode = quest.type === 'individual' ? 'individual' : quest.type === 'team' ? 'team' : modeByQuest[quest.id] ?? 'individual';

    setSubmittingQuestId(quest.id);
    try {
      await enterQuest({
        questId: quest.id,
        participantId: mode === 'team' ? user.teamId ?? user.id : user.id,
        participantName: mode === 'team' ? user.teamName ?? user.name : user.name,
        mode,
      });
      setEnteredQuestIds((prev) => new Set(prev).add(quest.id));
    } catch {
      Alert.alert('Could not enter quest', 'Could not reach the backend. Check your connection and try again.');
    } finally {
      setSubmittingQuestId(null);
    }
  };

  const teamLeaderboard = leaderboard.filter((entry) => entry.type === 'team' && entry.period === 'quarter');
  const individualLeaderboard = leaderboard.filter((entry) => entry.type === 'individual' && entry.period === 'month');

  return (
    <Screen scroll>
      <View style={{ paddingTop: Spacing.sm, gap: Spacing.xxs }}>
        <AppText variant="title">Quests</AppText>
        <AppText variant="body" color={Colors.textSecondary}>
          Complete quests, alone or with your team, and earn perks.
        </AppText>
      </View>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
        {quests.map((quest) => {
          const entered = enteredQuestIds.has(quest.id);
          const isEither = quest.type === 'either';
          const selectedMode = modeByQuest[quest.id] ?? 'individual';

          return (
            <Card key={quest.id}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: Spacing.xs,
                  paddingVertical: 2,
                  borderRadius: Radii.pill,
                  backgroundColor: Colors.surfaceElevated,
                  marginBottom: Spacing.xs,
                }}>
                <AppText variant="caption" color={Colors.textSecondary}>
                  {TYPE_LABEL[quest.type]}
                </AppText>
              </View>
              <AppText variant="subtitle">{quest.title}</AppText>
              <AppText variant="body" color={Colors.textSecondary} style={{ marginTop: Spacing.xxs }}>
                {quest.description}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, marginTop: Spacing.sm }}>
                <IconSymbol name="trophy.fill" size={14} color={Colors.teal} />
                <AppText variant="label" color={Colors.teal}>
                  {quest.reward}
                </AppText>
              </View>
              <AppText variant="caption" color={Colors.textTertiary} style={{ marginTop: Spacing.xxs }}>
                Deadline {quest.deadline}
              </AppText>

              {isEither && !entered && (
                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
                  {(['individual', 'team'] as QuestEntryMode[]).map((mode) => (
                    <Pressable
                      key={mode}
                      onPress={() => setModeByQuest((prev) => ({ ...prev, [quest.id]: mode }))}
                      style={{
                        flex: 1,
                        paddingVertical: Spacing.xs,
                        borderRadius: Radii.md,
                        alignItems: 'center',
                        backgroundColor: selectedMode === mode ? Colors.surfaceElevated : Colors.surface,
                        borderWidth: 1,
                        borderColor: selectedMode === mode ? Colors.teal : Colors.border,
                      }}>
                      <AppText variant="caption" color={selectedMode === mode ? Colors.teal : Colors.textSecondary}>
                        {mode === 'individual' ? 'Enter individually' : 'Enter as team'}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={{ alignItems: 'center', marginTop: Spacing.md }}>
                <EnterQuestButton
                  entered={entered}
                  submitting={submittingQuestId === quest.id}
                  onPress={() => handleEnter(quest)}
                />
              </View>
            </Card>
          );
        })}
      </View>

      <View style={{ marginTop: Spacing.xxl, gap: Spacing.md }}>
        <AppText variant="title">Leaderboard</AppText>

        <View style={{ gap: Spacing.xs }}>
          <AppText variant="label" color={Colors.textSecondary}>
            Top teams this quarter
          </AppText>
          {teamLeaderboard.map((entry, index) => (
            <LeaderboardRow key={entry.id} rank={index + 1} entry={entry} />
          ))}
        </View>

        <View style={{ gap: Spacing.xs, marginTop: Spacing.sm }}>
          <AppText variant="label" color={Colors.textSecondary}>
            Top individuals this month
          </AppText>
          {individualLeaderboard.map((entry, index) => (
            <LeaderboardRow key={entry.id} rank={index + 1} entry={entry} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

function LeaderboardRow({ rank, entry }: { rank: number; entry: LeaderboardEntry }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: rank === 1 ? Colors.teal : Colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AppText variant="caption" color={rank === 1 ? Colors.background : Colors.textSecondary}>
          {rank}
        </AppText>
      </View>
      <AppText variant="body" style={{ flex: 1 }}>
        {entry.name}
      </AppText>
      <AppText variant="label" color={Colors.textSecondary}>
        {entry.questsCompleted} quests
      </AppText>
    </View>
  );
}
