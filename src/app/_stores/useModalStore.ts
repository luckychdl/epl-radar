import { create } from "zustand";

export type ModalType = "calendar";

interface ModalState {
  type: ModalType | null;
  props?: Record<string, unknown>;
  openModal: (type: ModalType, props?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  props: undefined,
  openModal: (type, props) => set({ type, props }),
  closeModal: () => set({ type: null, props: undefined }),
}));
