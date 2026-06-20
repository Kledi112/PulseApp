import type { ActiveService, ActiveServiceStatus } from '@/data/active-services';

import { api } from './api-client';

type ActiveServiceResponse = {
  id: number;
  employee_id: number;
  service_id: number;
  token: string;
  title: string;
  provider_name: string;
  price_all: number;
  status: ActiveServiceStatus;
  taken_at: string;
  claimed_at: string | null;
};

export type Budget = {
  monthlyBudgetAll: number;
  reservedAll: number;
  claimedAll: number;
  remainingAll: number;
};

type BudgetResponse = {
  monthly_budget_all: number;
  reserved_all: number;
  claimed_all: number;
  remaining_all: number;
};

function mapActiveService(data: ActiveServiceResponse): ActiveService {
  return {
    id: String(data.id),
    employeeId: String(data.employee_id),
    serviceId: String(data.service_id),
    token: data.token,
    title: data.title,
    providerName: data.provider_name,
    priceAll: data.price_all,
    status: data.status,
    takenAt: data.taken_at,
    claimedAt: data.claimed_at ?? undefined,
  };
}

function mapBudget(data: BudgetResponse): Budget {
  return {
    monthlyBudgetAll: data.monthly_budget_all,
    reservedAll: data.reserved_all,
    claimedAll: data.claimed_all,
    remainingAll: data.remaining_all,
  };
}

export async function getMyPerks(statusFilter?: ActiveServiceStatus): Promise<ActiveService[]> {
  const query = statusFilter ? `?status_filter=${statusFilter}` : '';
  const result = await api.get<ActiveServiceResponse[]>(`/active-services${query}`);
  return result.map(mapActiveService);
}

export async function getMyBudget(): Promise<Budget> {
  const result = await api.get<BudgetResponse>('/active-services/budget');
  return mapBudget(result);
}

export async function takePerk(serviceId: string): Promise<ActiveService> {
  const result = await api.post<ActiveServiceResponse>('/active-services', { service_id: Number(serviceId) });
  return mapActiveService(result);
}

export async function takeBundle(serviceIds: string[]): Promise<ActiveService[]> {
  const result = await api.post<ActiveServiceResponse[]>('/active-services/bundle', {
    service_ids: serviceIds.map(Number),
  });
  return result.map(mapActiveService);
}
