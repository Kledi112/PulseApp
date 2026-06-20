import { create } from 'zustand';

type ConnectionErrorState = {
  visible: boolean;
  title: string;
  message: string;
  show: (title: string, message: string) => void;
  hide: () => void;
};

export const useConnectionErrorStore = create<ConnectionErrorState>((set) => ({
  visible: false,
  title: '',
  message: '',
  show: (title, message) => set({ visible: true, title, message }),
  hide: () => set({ visible: false }),
}));
