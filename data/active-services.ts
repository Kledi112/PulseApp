export type ActiveServiceStatus = 'pending' | 'active';

export type ActiveService = {
  id: string;
  employeeId: string;
  requestId: string;
  title: string;
  providerName: string;
  priceAll: number;
  status: ActiveServiceStatus;
  requestedAt: string;
};

export const activeServices: ActiveService[] = [
  {
    id: 'service-1',
    employeeId: 'user-employee-1',
    requestId: 'req-seed-1',
    title: 'Annual dental checkup',
    providerName: 'SmileCare Dental',
    priceAll: 4200,
    status: 'pending',
    requestedAt: '2026-06-15T09:00:00.000Z',
  },
  {
    id: 'service-2',
    employeeId: 'user-employee-1',
    requestId: 'req-seed-2',
    title: 'Gym membership, 1 month',
    providerName: 'PowerHouse Fitness',
    priceAll: 3000,
    status: 'active',
    requestedAt: '2026-06-01T08:00:00.000Z',
  },
];
