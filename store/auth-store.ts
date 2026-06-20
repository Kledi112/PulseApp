import { create } from 'zustand';

import { loginAsDemoEmployee, loginAsDemoManager, logout } from '@/services/auth';
import { User } from '@/types';

type AuthState = {
  user: User | null;
  signIn: (user: User) => void;
  signInAsDemoEmployee: () => Promise<void>;
  signInAsDemoManager: () => Promise<void>;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: (user) => set({ user }),
  signInAsDemoEmployee: async () => {
    const user = await loginAsDemoEmployee();
    set({ user });
  },
  signInAsDemoManager: async () => {
    const user = await loginAsDemoManager();
    set({ user });
  },
  signOut: () => {
    logout();
    set({ user: null });
  },
  updateProfile: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
}));
