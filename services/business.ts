import { BusinessApplication } from '@/types';

import { delay } from './mock-delay';

export async function submitBusinessApplication(payload: BusinessApplication): Promise<{ success: true }> {
  // TODO: wire to backend / email (e.g. EmailJS or API endpoint) to forward this application to the Pulse operations team.
  console.log('[submitBusinessApplication] payload ready for backend:', payload);
  return delay({ success: true as const }, 600);
}
