import { create } from 'zustand';

type LoadingState = {
  count: number;
  start: () => void;
  finish: () => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  count: 0,
  start: () => set((state) => ({ count: state.count + 1 })),
  finish: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
}));
