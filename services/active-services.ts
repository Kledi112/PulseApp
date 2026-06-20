import type { ActiveService, ActiveServiceStatus } from '@/data/active-services';

import { api } from './api-client';

type ActiveServiceResponse = {
  id: number;
  employee_id: number;
  request_id: number;
  service_id: number;
  title: string;
  provider_name: string;
  price_all: number;
  status: ActiveServiceStatus;
  requested_at: string;
};

function mapActiveService(data: ActiveServiceResponse): ActiveService {
  return {
    id: String(data.id),
    employeeId: String(data.employee_id),
    requestId: String(data.request_id),
    title: data.title,
    providerName: data.provider_name,
    priceAll: data.price_all,
    status: data.status,
    requestedAt: data.requested_at,
  };
}

// employeeId is unused now - the backend scopes results to the authenticated employee's
// own token, but the parameter is kept so existing call sites don't need to change.
export async function getActiveServices(employeeId: string) {
  const result = await api.get<ActiveServiceResponse[]>('/active-services');
  return result.map(mapActiveService);
}

export async function getPendingServices(employeeId: string) {
  const result = await api.get<ActiveServiceResponse[]>('/active-services?status_filter=pending');
  return result.map(mapActiveService);
}

export async function getActivePerks(employeeId: string) {
  const result = await api.get<ActiveServiceResponse[]>('/active-services?status_filter=active');
  return result.map(mapActiveService);
}
