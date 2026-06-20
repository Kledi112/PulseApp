import { create } from 'zustand';

import { Perk } from '@/types';

type BundleState = {
  items: Perk[];
  addPerk: (perk: Perk) => void;
  removePerk: (perkId: string) => void;
  clear: () => void;
};

export const useBundleStore = create<BundleState>((set) => ({
  items: [],
  addPerk: (perk) =>
    set((state) => (state.items.some((item) => item.id === perk.id) ? state : { items: [...state.items, perk] })),
  removePerk: (perkId) => set((state) => ({ items: state.items.filter((item) => item.id !== perkId) })),
  clear: () => set({ items: [] }),
}));
