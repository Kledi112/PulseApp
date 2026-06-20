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

export async function getPerks(): Promise<Perk[]> {
  const result = await api.get<ServiceResponse[]>('/services');
  return result.map(mapService);
}

export async function getPerksByCategory(category: Category | 'all'): Promise<Perk[]> {
  const query = category === 'all' ? '' : `?category=${category}`;
  const result = await api.get<ServiceResponse[]>(`/services${query}`);
  return result.map(mapService);
}

export async function getPerkById(id: string): Promise<Perk | undefined> {
  try {
    const result = await api.get<ServiceResponse>(`/services/${id}`);
    return mapService(result);
  } catch {
    return undefined;
  }
}
