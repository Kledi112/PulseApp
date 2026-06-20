import { LeaderboardEntry, Quest } from '@/types';

export const quests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Close the Q2 onboarding flow bug',
    description: 'Team that ships the fix to production by Friday gets a pre-approved dinner at Padam.',
    reward: 'Dinner for the team at Padam',
    type: 'team',
    deadline: '2026-06-26',
    status: 'active',
  },
  {
    id: 'quest-2',
    title: 'Refer a friend to Pulse',
    description: 'Get a friend to sign up their company and earn a wellness perk on the house.',
    reward: 'Free EuroSpa massage session',
    type: 'individual',
    deadline: '2026-07-10',
    status: 'active',
  },
  {
    id: 'quest-3',
    title: 'Complete the quarterly wellness challenge',
    description: 'Log five workouts this month, alone or with your team.',
    reward: '4000 ALL wellness credit',
    type: 'either',
    deadline: '2026-06-30',
    status: 'active',
  },
  {
    id: 'quest-4',
    title: 'Ship the new marketplace filters',
    description: 'First team to ship category filtering wins a celebration outing.',
    reward: 'Team trip to Dajti Ekspres',
    type: 'team',
    deadline: '2026-06-10',
    status: 'awaiting_winner',
  },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: 'lb-team-1', name: 'Engineering', type: 'team', questsCompleted: 7, period: 'quarter' },
  { id: 'lb-team-2', name: 'Product & Design', type: 'team', questsCompleted: 5, period: 'quarter' },
  { id: 'lb-team-3', name: 'Sales', type: 'team', questsCompleted: 3, period: 'quarter' },
  { id: 'lb-ind-1', name: 'Diana Shehu', type: 'individual', questsCompleted: 4, period: 'month' },
  { id: 'lb-ind-2', name: 'Elira Hoxha', type: 'individual', questsCompleted: 3, period: 'month' },
  { id: 'lb-ind-3', name: 'Klajdi Mema', type: 'individual', questsCompleted: 3, period: 'month' },
  { id: 'lb-ind-4', name: 'Arben Krasniqi', type: 'individual', questsCompleted: 2, period: 'month' },
];
