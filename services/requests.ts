import { activeServices } from '@/data/active-services';
import { claimedPerks } from '@/data/claimed-perks';
import { requests } from '@/data/requests';
import { Request, RequestItem } from '@/types';

import { delay } from './mock-delay';

let requestCounter = requests.length;

type SubmitRequestPayload = {
  employeeId: string;
  employeeName: string;
  type: 'single' | 'bundle';
  items: RequestItem[];
  totalAll: number;
};

export async function submitRequest(payload: SubmitRequestPayload): Promise<Request> {
  requestCounter += 1;
  const request: Request = {
    id: `req-${requestCounter}`,
    ...payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  requests.unshift(request);

  request.items.forEach((item) => {
    activeServices.unshift({
      id: `service-${item.perkId}-${request.id}`,
      employeeId: request.employeeId,
      requestId: request.id,
      title: item.title,
      providerName: item.providerName,
      priceAll: item.discountedPriceAll,
      status: 'pending',
      requestedAt: request.createdAt,
    });
  });

  return delay(request);
}

export async function getActiveRequests(): Promise<Request[]> {
  return delay(requests.filter((request) => request.status === 'pending'));
}

export async function getAllRequests(): Promise<Request[]> {
  return delay(requests);
}

type PaymentMethod = 'card' | 'paypal';

export async function approveRequest(requestId: string, paymentMethod: PaymentMethod): Promise<Request> {
  const request = requests.find((item) => item.id === requestId);
  if (!request) throw new Error('Request not found');
  request.status = 'approved';
  request.paidAt = new Date().toISOString();
  request.paymentMethod = paymentMethod;

  request.items.forEach((item) => {
    claimedPerks.unshift({
      id: `claim-${item.perkId}-${request.id}`,
      employeeId: request.employeeId,
      title: item.title,
      providerName: item.providerName,
      priceAll: item.discountedPriceAll,
      claimedAt: request.paidAt!,
    });
  });

  activeServices
    .filter((service) => service.requestId === request.id)
    .forEach((service) => {
      service.status = 'active';
    });

  return delay(request);
}

export async function declineRequest(requestId: string): Promise<Request> {
  const request = requests.find((item) => item.id === requestId);
  if (!request) throw new Error('Request not found');
  request.status = 'declined';

  for (let i = activeServices.length - 1; i >= 0; i -= 1) {
    if (activeServices[i].requestId === request.id) {
      activeServices.splice(i, 1);
    }
  }

  return delay(request);
}

export async function getClaimedPerks(employeeId: string) {
  return delay(claimedPerks.filter((claim) => claim.employeeId === employeeId));
}
