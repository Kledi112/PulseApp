import { activeServices } from '@/data/active-services';

import { delay } from './mock-delay';

export async function getActiveServices(employeeId: string) {
  return delay(activeServices.filter((service) => service.employeeId === employeeId));
}

export async function getPendingServices(employeeId: string) {
  return delay(activeServices.filter((service) => service.employeeId === employeeId && service.status === 'pending'));
}

export async function getActivePerks(employeeId: string) {
  return delay(activeServices.filter((service) => service.employeeId === employeeId && service.status === 'active'));
}
