import { BusinessApplication } from '@/types';

import { api } from './api-client';

export async function submitBusinessApplication(payload: BusinessApplication): Promise<{ success: true }> {
  await api.post('/business-applications', {
    business_name: payload.businessName,
    nipt: payload.nipt,
    employee_count: Number(payload.employeeCount),
    contact_number: payload.contactNumber,
    email: payload.email,
  });
  return { success: true as const };
}
