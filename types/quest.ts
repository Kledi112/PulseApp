export type QuestType = 'team' | 'individual' | 'either';
export type QuestStatus = 'active' | 'awaiting_winner' | 'completed';

export type Quest = {
  id: string;
  title: string;
  description: string;
  reward: string;
  type: QuestType;
  deadline: string;
  status: QuestStatus;
  winnerId?: string;
  winnerName?: string;
};

export type QuestEntryMode = 'individual' | 'team';

export type QuestEntry = {
  id: string;
  questId: string;
  participantId: string;
  participantName: string;
  mode: QuestEntryMode;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  type: 'team' | 'individual';
  questsCompleted: number;
  period: 'month' | 'quarter';
};
