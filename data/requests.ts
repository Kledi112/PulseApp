import { Request } from '@/types';

export const requests: Request[] = [
  {
    id: 'req-1',
    employeeId: 'user-employee-2',
    employeeName: 'Arben Krasniqi',
    type: 'single',
    items: [
      { perkId: 'perk-2', title: 'Monthly gym membership', providerName: 'Pure Gym Tirana', originalPriceAll: 4000, discountedPriceAll: 4000 },
    ],
    totalAll: 4000,
    status: 'pending',
    createdAt: '2026-06-18T09:30:00.000Z',
  },
  {
    id: 'req-2',
    employeeId: 'user-employee-3',
    employeeName: 'Diana Shehu',
    type: 'bundle',
    items: [
      { perkId: 'perk-6', title: 'Movie night for two', providerName: 'Cineplexx', originalPriceAll: 1600, discountedPriceAll: 1440 },
      { perkId: 'perk-11', title: 'Coffee and pastry subscription', providerName: 'Komiteti Kafe', originalPriceAll: 3200, discountedPriceAll: 2880 },
    ],
    totalAll: 4320,
    status: 'pending',
    createdAt: '2026-06-19T14:05:00.000Z',
  },
];
