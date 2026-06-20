import { Perk } from './perk';

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  perks?: Perk[];
  createdAt: string;
};
