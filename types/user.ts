export type UserRole = 'employee' | 'manager';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUri?: string;
  teamId?: string;
  teamName?: string;
};
