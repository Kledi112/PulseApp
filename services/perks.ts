import { perks } from '@/data/perks';
import { Category, Perk } from '@/types';

import { delay } from './mock-delay';

export async function getPerks(): Promise<Perk[]> {
  return delay(perks);
}

export async function getPerksByCategory(category: Category | 'all'): Promise<Perk[]> {
  if (category === 'all') return delay(perks);
  return delay(perks.filter((perk) => perk.category === category));
}

export async function getPerkById(id: string): Promise<Perk | undefined> {
  return delay(perks.find((perk) => perk.id === id));
}
