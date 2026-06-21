import { api } from './api-client';

export type PoolContribution = {
  employeeId: string;
  employeeName: string;
  amountAll: number;
  contributedAt: string;
};

export type PerkPool = {
  id: string;
  serviceId: string;
  title: string;
  providerName: string;
  hostEmployeeId: string;
  hostName: string;
  targetAmountAll: number;
  contributedAll: number;
  status: 'open' | 'completed' | 'cancelled';
  activeServiceId: string | null;
  createdAt: string;
  completedAt: string | null;
  contributions: PoolContribution[];
};

type PoolContributionResponse = {
  employee_id: number;
  employee_name: string;
  amount_all: number;
  contributed_at: string;
};

type PerkPoolResponse = {
  id: number;
  service_id: number;
  title: string;
  provider_name: string;
  host_employee_id: number;
  host_name: string;
  target_amount_all: number;
  contributed_all: number;
  status: 'open' | 'completed' | 'cancelled';
  active_service_id: number | null;
  created_at: string;
  completed_at: string | null;
  contributions: PoolContributionResponse[];
};

function mapPool(data: PerkPoolResponse): PerkPool {
  return {
    id: String(data.id),
    serviceId: String(data.service_id),
    title: data.title,
    providerName: data.provider_name,
    hostEmployeeId: String(data.host_employee_id),
    hostName: data.host_name,
    targetAmountAll: data.target_amount_all,
    contributedAll: data.contributed_all,
    status: data.status,
    activeServiceId: data.active_service_id != null ? String(data.active_service_id) : null,
    createdAt: data.created_at,
    completedAt: data.completed_at,
    contributions: data.contributions.map((c) => ({
      employeeId: String(c.employee_id),
      employeeName: c.employee_name,
      amountAll: c.amount_all,
      contributedAt: c.contributed_at,
    })),
  };
}

export async function getOpenPools(): Promise<PerkPool[]> {
  const result = await api.get<PerkPoolResponse[]>('/perk-pools');
  return result.map(mapPool);
}

export async function createPool(serviceId: string, amountAll: number): Promise<PerkPool> {
  const result = await api.post<PerkPoolResponse>('/perk-pools', { service_id: Number(serviceId), amount_all: amountAll });
  return mapPool(result);
}

export async function joinPool(poolId: string, amountAll: number): Promise<PerkPool> {
  const result = await api.post<PerkPoolResponse>(`/perk-pools/${poolId}/join`, { amount_all: amountAll });
  return mapPool(result);
}

export async function cancelPool(poolId: string): Promise<PerkPool> {
  const result = await api.post<PerkPoolResponse>(`/perk-pools/${poolId}/cancel`);
  return mapPool(result);
}
