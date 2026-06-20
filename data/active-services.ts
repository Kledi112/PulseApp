export type ActiveServiceStatus = 'active' | 'claimed';

export type ActiveService = {
  id: string;
  employeeId: string;
  serviceId: string;
  token: string;
  title: string;
  providerName: string;
  priceAll: number;
  status: ActiveServiceStatus;
  takenAt: string;
  claimedAt?: string;
};
