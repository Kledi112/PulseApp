export type ClaimedPerk = {
  id: string;
  employeeId: string;
  title: string;
  providerName: string;
  priceAll: number;
  claimedAt: string;
};

export const claimedPerks: ClaimedPerk[] = [
  {
    id: 'claim-1',
    employeeId: 'user-employee-1',
    title: 'Full body massage session',
    providerName: 'EuroSpa Wellness',
    priceAll: 3800,
    claimedAt: '2026-05-12T10:00:00.000Z',
  },
  {
    id: 'claim-2',
    employeeId: 'user-employee-1',
    title: 'Three-course dinner for two',
    providerName: 'Padam',
    priceAll: 6500,
    claimedAt: '2026-04-02T18:30:00.000Z',
  },
  {
    id: 'claim-3',
    employeeId: 'user-employee-1',
    title: 'Unlimited mobile data plan',
    providerName: 'One Telecommunications',
    priceAll: 1800,
    claimedAt: '2026-03-15T08:00:00.000Z',
  },
];
