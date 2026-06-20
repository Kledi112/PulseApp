import { User } from '@/types';

export const demoEmployee: User = {
  id: 'user-employee-1',
  name: 'Elira Hoxha',
  email: 'elira.hoxha@pulse.al',
  role: 'employee',
  teamId: 'team-1',
  teamName: 'Product & Design',
};

export const demoManager: User = {
  id: 'user-manager-1',
  name: 'Gentian Berisha',
  email: 'gentian.berisha@pulse.al',
  role: 'manager',
};

export const employees: User[] = [
  demoEmployee,
  { id: 'user-employee-2', name: 'Arben Krasniqi', email: 'arben.krasniqi@pulse.al', role: 'employee', teamId: 'team-1', teamName: 'Product & Design' },
  { id: 'user-employee-3', name: 'Diana Shehu', email: 'diana.shehu@pulse.al', role: 'employee', teamId: 'team-2', teamName: 'Engineering' },
  { id: 'user-employee-4', name: 'Klajdi Mema', email: 'klajdi.mema@pulse.al', role: 'employee', teamId: 'team-2', teamName: 'Engineering' },
  { id: 'user-employee-5', name: 'Sara Lika', email: 'sara.lika@pulse.al', role: 'employee', teamId: 'team-3', teamName: 'Sales' },
];
