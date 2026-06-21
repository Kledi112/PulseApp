import { Category, Perk } from '@/types';

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

export async function getSavedPerks(): Promise<Perk[]> {
  const result = await api.get<ServiceResponse[]>('/saved-perks');
  return result.map(mapService);
}

export async function savePerk(serviceId: string): Promise<void> {
  await api.post('/saved-perks', { service_id: Number(serviceId) });
}

export async function unsavePerk(serviceId: string): Promise<void> {
  await api.delete(`/saved-perks/${serviceId}`);
}
