import { create } from 'zustand';

import { logout, registerForDemo } from '@/services/auth';
import { User } from '@/types';

type AuthState = {
  user: User | null;
  signIn: (user: User) => void;
  signUpForDemo: (email: string, password: string, role: 'employee' | 'manager') => Promise<void>;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: (user) => set({ user }),
  signUpForDemo: async (email, password, role) => {
    const user = await registerForDemo(email, password, role);
    set({ user });
  },
  signOut: () => {
    logout();
    set({ user: null });
  },
  updateProfile: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
}));
