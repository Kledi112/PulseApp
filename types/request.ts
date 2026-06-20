export type RequestItem = {
  perkId: string;
  title: string;
  providerName: string;
  originalPriceAll: number;
  discountedPriceAll: number;
};

export type RequestStatus = 'pending' | 'approved' | 'declined';

export type Request = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'single' | 'bundle';
  items: RequestItem[];
  totalAll: number;
  status: RequestStatus;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: 'card' | 'paypal';
};
