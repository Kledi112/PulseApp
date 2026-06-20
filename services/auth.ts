import { User } from '@/types';

import { api, clearAuthToken, setAuthToken } from './api-client';

type TokenResponse = {
  access_token: string;
  token_type: string;
  role: string;
};

type EmployeeResponse = {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  avatar_uri: string | null;
  team_id: number | null;
  team_name: string | null;
};

function mapEmployee(data: EmployeeResponse): User {
  return {
    id: String(data.id),
    name: data.name,
    email: data.email,
    role: data.role,
    avatarUri: data.avatar_uri ?? undefined,
    teamId: data.team_id != null ? String(data.team_id) : undefined,
    teamName: data.team_name ?? undefined,
  };
}

export async function loginWithCredentials(email: string, password: string): Promise<User> {
  const token = await api.post<TokenResponse>('/auth/login', { email, password });
  setAuthToken(token.access_token);
  const me = await api.get<EmployeeResponse>('/employees/me');
  return mapEmployee(me);
}

// Seeded backend accounts used by the "demo access" buttons on the login screen,
// so a presenter can get into the app without typing credentials. These must exist
// in whichever database the demo is run against (see backend/DATABASE.md).
const DEMO_EMPLOYEE_CREDENTIALS = { email: 'elira@pulse.al', password: 'pass1234' };
const DEMO_MANAGER_CREDENTIALS = { email: 'gentian@pulse.al', password: 'pass1234' };

export function loginAsDemoEmployee(): Promise<User> {
  return loginWithCredentials(DEMO_EMPLOYEE_CREDENTIALS.email, DEMO_EMPLOYEE_CREDENTIALS.password);
}

export function loginAsDemoManager(): Promise<User> {
  return loginWithCredentials(DEMO_MANAGER_CREDENTIALS.email, DEMO_MANAGER_CREDENTIALS.password);
}

export function logout() {
  clearAuthToken();
}
