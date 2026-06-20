import { create } from 'zustand';

import { demoEmployee, demoManager } from '@/data/users';
import { User } from '@/types';

type AuthState = {
  user: User | null;
  signIn: (user: User) => void;
  signInAsDemoEmployee: () => void;
  signInAsDemoManager: () => void;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: (user) => set({ user }),
  signInAsDemoEmployee: () => set({ user: demoEmployee }),
  signInAsDemoManager: () => set({ user: demoManager }),
  signOut: () => set({ user: null }),
  updateProfile: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
}));
