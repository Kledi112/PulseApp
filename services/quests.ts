import { leaderboard, quests } from '@/data/quests';
import { LeaderboardEntry, Quest, QuestEntry, QuestEntryMode, QuestType } from '@/types';

import { delay } from './mock-delay';

let questCounter = quests.length;
const questEntries: QuestEntry[] = [
  { id: 'entry-seed-1', questId: 'quest-4', participantId: 'team-2', participantName: 'Engineering', mode: 'team' },
  { id: 'entry-seed-2', questId: 'quest-4', participantId: 'team-1', participantName: 'Product & Design', mode: 'team' },
];

export async function getQuests(): Promise<Quest[]> {
  return delay(quests);
}

type EnterQuestPayload = {
  questId: string;
  participantId: string;
  participantName: string;
  mode: QuestEntryMode;
};

export async function enterQuest(payload: EnterQuestPayload): Promise<QuestEntry> {
  const entry: QuestEntry = { id: `entry-${questEntries.length + 1}`, ...payload };
  questEntries.push(entry);
  return delay(entry);
}

export async function getLeaderboard(period?: 'month' | 'quarter'): Promise<LeaderboardEntry[]> {
  if (!period) return delay(leaderboard);
  return delay(leaderboard.filter((entry) => entry.period === period));
}

type CreateQuestPayload = {
  title: string;
  description: string;
  reward: string;
  type: QuestType;
  deadline: string;
};

export async function createQuest(payload: CreateQuestPayload): Promise<Quest> {
  questCounter += 1;
  const quest: Quest = {
    id: `quest-${questCounter}`,
    ...payload,
    status: 'active',
  };
  quests.unshift(quest);
  return delay(quest);
}

export async function getEntriesForQuest(questId: string): Promise<QuestEntry[]> {
  return delay(questEntries.filter((entry) => entry.questId === questId));
}

export async function getQuestsAwaitingWinner(): Promise<Quest[]> {
  return delay(quests.filter((quest) => quest.status === 'awaiting_winner'));
}

export async function selectQuestWinner(questId: string, winnerId: string, winnerName: string): Promise<Quest> {
  const quest = quests.find((item) => item.id === questId);
  if (!quest) throw new Error('Quest not found');
  quest.status = 'completed';
  quest.winnerId = winnerId;
  quest.winnerName = winnerName;
  return delay(quest);
}
