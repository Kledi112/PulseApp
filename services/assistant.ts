import { perks } from '@/data/perks';
import { AssistantMessage, Category } from '@/types';

import { delay } from './mock-delay';

const KEYWORD_CATEGORY: { keywords: string[]; category: Category }[] = [
  { keywords: ['relax', 'stress', 'calm', 'massage', 'spa'], category: 'wellness' },
  { keywords: ['eat', 'food', 'dinner', 'lunch', 'restaurant', 'hungry'], category: 'food' },
  { keywords: ['travel', 'trip', 'vacation', 'holiday', 'weekend away'], category: 'travel' },
  { keywords: ['fun', 'movie', 'entertainment', 'weekend'], category: 'fun' },
  { keywords: ['phone', 'data', 'mobile', 'internet'], category: 'telecom' },
  { keywords: ['health', 'doctor', 'checkup', 'clinic'], category: 'healthcare' },
];

function matchCategory(text: string): Category | undefined {
  const lower = text.toLowerCase();
  const match = KEYWORD_CATEGORY.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  return match?.category;
}

// TODO: replace this stub with a real AI backend call behind the same function signature.
export async function sendAssistantMessage(text: string): Promise<AssistantMessage> {
  const category = matchCategory(text);
  const matchingPerks = category ? perks.filter((perk) => perk.category === category).slice(0, 2) : [];

  const reply: AssistantMessage = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    text: matchingPerks.length
      ? `Here is something that might fit. I found ${matchingPerks.length} option${matchingPerks.length > 1 ? 's' : ''} for you.`
      : 'I am not sure yet, but try asking about food, travel, wellness, or fun and I will find a perk for you.',
    perks: matchingPerks,
    createdAt: new Date().toISOString(),
  };

  return delay(reply, 900);
}
