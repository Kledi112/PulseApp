import { AssistantMessage, Category, Perk } from '@/types';

import { api } from './api-client';

type ServiceResponse = {
  id: number;
  provider_id: number;
  provider_name: string;
  title: string;
  description: string | null;
  category: string | null;
  price_all: number;
  image_uri: string | null;
  active: boolean;
};

type AssistantResponse = {
  text: string;
  perks: ServiceResponse[];
};

function mapService(data: ServiceResponse): Perk {
  return {
    id: String(data.id),
    providerId: String(data.provider_id),
    providerName: data.provider_name,
    title: data.title,
    description: data.description ?? '',
    category: (data.category ?? 'fun') as Category,
    priceAll: data.price_all,
    imageUri: data.image_uri ?? '',
  };
}

// Gemini calls routinely take longer than the default 1.5s fetch timeout used by
// quick CRUD endpoints, so this gets a much longer per-attempt budget.
const ASSISTANT_TIMEOUT_MS = 20000;

export async function sendAssistantMessage(text: string): Promise<AssistantMessage> {
  const result = await api.post<AssistantResponse>('/ai/assistant', { message: text }, ASSISTANT_TIMEOUT_MS);
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    text: result.text,
    perks: result.perks.map(mapService),
    createdAt: new Date().toISOString(),
  };
}
