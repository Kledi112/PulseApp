import type { ClaimedPerk } from '@/data/claimed-perks';
import { Request, RequestItem } from '@/types';

import { api } from './api-client';

type RequestItemResponse = {
  id: number;
  service_id: number;
  title: string;
  provider_name: string;
  original_price_all: number;
  discounted_price_all: number;
};

type RequestResponse = {
  id: number;
  employee_id: number;
  employee_name: string;
  type: 'single' | 'bundle';
  items: RequestItemResponse[];
  total_all: number;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  paid_at: string | null;
  payment_method: 'card' | 'paypal' | null;
};

type RedeemedHistoryResponse = {
  id: number;
  employee_id: number;
  service_id: number;
  title: string;
  provider_name: string;
  price_all: number;
  claimed_at: string;
};

function mapRequestItem(data: RequestItemResponse): RequestItem {
  return {
    perkId: String(data.service_id),
    title: data.title,
    providerName: data.provider_name,
    originalPriceAll: data.original_price_all,
    discountedPriceAll: data.discounted_price_all,
  };
}

function mapRequest(data: RequestResponse): Request {
  return {
    id: String(data.id),
    employeeId: String(data.employee_id),
    employeeName: data.employee_name,
    type: data.type,
    items: data.items.map(mapRequestItem),
    totalAll: data.total_all,
    status: data.status,
    createdAt: data.created_at,
    paidAt: data.paid_at ?? undefined,
    paymentMethod: data.payment_method ?? undefined,
  };
}

function mapClaimedPerk(data: RedeemedHistoryResponse): ClaimedPerk {
  return {
    id: String(data.id),
    employeeId: String(data.employee_id),
    title: data.title,
    providerName: data.provider_name,
    priceAll: data.price_all,
    claimedAt: data.claimed_at,
  };
}

type SubmitRequestPayload = {
  employeeId: string;
  employeeName: string;
  type: 'single' | 'bundle';
  items: RequestItem[];
  totalAll: number;
};

// employeeId/employeeName/totalAll are no longer sent - the backend derives the employee
// from the auth token and recomputes pricing from the live catalog. Kept in the payload
// shape so existing call sites (marketplace.tsx, bundle.tsx) don't need to change.
export async function submitRequest(payload: SubmitRequestPayload): Promise<Request> {
  const result = await api.post<RequestResponse>('/requests', {
    type: payload.type,
    service_ids: payload.items.map((item) => Number(item.perkId)),
  });
  return mapRequest(result);
}

export async function getActiveRequests(): Promise<Request[]> {
  const result = await api.get<RequestResponse[]>('/requests?status_filter=pending');
  return result.map(mapRequest);
}

export async function getAllRequests(): Promise<Request[]> {
  const result = await api.get<RequestResponse[]>('/requests');
  return result.map(mapRequest);
}

type PaymentMethod = 'card' | 'paypal';

export async function approveRequest(requestId: string, paymentMethod: PaymentMethod): Promise<Request> {
  const result = await api.post<RequestResponse>(`/requests/${requestId}/approve`, { payment_method: paymentMethod });
  return mapRequest(result);
}

export async function declineRequest(requestId: string): Promise<Request> {
  const result = await api.post<RequestResponse>(`/requests/${requestId}/decline`);
  return mapRequest(result);
}

// employeeId is unused now - scoped by the auth token - kept for call-site compatibility.
export async function getClaimedPerks(employeeId: string) {
  const result = await api.get<RedeemedHistoryResponse[]>('/redeemed-history');
  return result.map(mapClaimedPerk);
}
