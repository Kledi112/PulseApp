import { LeaderboardEntry, Quest, QuestEntry, QuestEntryMode, QuestType } from '@/types';

import { api } from './api-client';

type QuestResponse = {
  id: number;
  title: string;
  description: string | null;
  reward: string;
  type: QuestType;
  deadline: string;
  status: Quest['status'];
  winner_id: number | null;
  winner_name: string | null;
};

type QuestEntryResponse = {
  id: number;
  quest_id: number;
  mode: QuestEntryMode;
  participant_id: number;
  participant_name: string;
};

type LeaderboardEntryResponse = {
  id: string;
  name: string;
  type: 'team' | 'individual';
  quests_completed: number;
  period: 'month' | 'quarter';
};

function mapQuest(data: QuestResponse): Quest {
  return {
    id: String(data.id),
    title: data.title,
    description: data.description ?? '',
    reward: data.reward,
    type: data.type,
    deadline: data.deadline,
    status: data.status,
    winnerId: data.winner_id != null ? String(data.winner_id) : undefined,
    winnerName: data.winner_name ?? undefined,
  };
}

function mapQuestEntry(data: QuestEntryResponse): QuestEntry {
  return {
    id: String(data.id),
    questId: String(data.quest_id),
    participantId: String(data.participant_id),
    participantName: data.participant_name,
    mode: data.mode,
  };
}

function mapLeaderboardEntry(data: LeaderboardEntryResponse): LeaderboardEntry {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    questsCompleted: data.quests_completed,
    period: data.period,
  };
}

export async function getQuests(): Promise<Quest[]> {
  const result = await api.get<QuestResponse[]>('/quests');
  return result.map(mapQuest);
}

type EnterQuestPayload = {
  questId: string;
  participantId: string;
  participantName: string;
  mode: QuestEntryMode;
};

export async function enterQuest(payload: EnterQuestPayload): Promise<QuestEntry> {
  const result = await api.post<QuestEntryResponse>(`/quests/${payload.questId}/entries`, {
    mode: payload.mode,
    team_id: payload.mode === 'team' ? Number(payload.participantId) : undefined,
  });
  return mapQuestEntry(result);
}

export async function getLeaderboard(period?: 'month' | 'quarter'): Promise<LeaderboardEntry[]> {
  const query = period ? `?period=${period}` : '';
  const result = await api.get<LeaderboardEntryResponse[]>(`/quests/leaderboard${query}`);
  return result.map(mapLeaderboardEntry);
}

type CreateQuestPayload = {
  title: string;
  description: string;
  reward: string;
  type: QuestType;
  deadline: string;
};

export async function createQuest(payload: CreateQuestPayload): Promise<Quest> {
  const result = await api.post<QuestResponse>('/quests', payload);
  return mapQuest(result);
}

export async function getEntriesForQuest(questId: string): Promise<QuestEntry[]> {
  const result = await api.get<QuestEntryResponse[]>(`/quests/${questId}/entries`);
  return result.map(mapQuestEntry);
}

export async function getQuestsAwaitingWinner(): Promise<Quest[]> {
  const result = await api.get<QuestResponse[]>('/quests/awaiting-winner');
  return result.map(mapQuest);
}

// `mode` (added) tells us whether winnerId refers to an employee or a team -
// the one call site (quest-management.tsx) now passes entry.mode through.
export async function selectQuestWinner(
  questId: string,
  winnerId: string,
  winnerName: string,
  mode: QuestEntryMode
): Promise<Quest> {
  const body = mode === 'team' ? { team_id: Number(winnerId) } : { employee_id: Number(winnerId) };
  const result = await api.post<QuestResponse>(`/quests/${questId}/select-winner`, body);
  return mapQuest(result);
}
