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

function deriveNameFromEmail(email: string): string {
  const local = email.split('@')[0] || email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

// Backs the "demo access" form on the login screen - anyone can spin up their own
// employee or manager account on the fly instead of everyone sharing one seeded
// login (which made two people's actions on the same account stomp on each other).
export async function registerForDemo(email: string, password: string, role: 'employee' | 'manager'): Promise<User> {
  const token = await api.post<TokenResponse>('/auth/register', {
    name: deriveNameFromEmail(email),
    email,
    password,
    role,
  });
  setAuthToken(token.access_token);
  const me = await api.get<EmployeeResponse>('/employees/me');
  return mapEmployee(me);
}

export function logout() {
  clearAuthToken();
}
