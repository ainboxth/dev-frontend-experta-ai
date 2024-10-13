import { create } from "zustand";

interface MagicUploadedStateType {
  magicUploadedState: boolean;
  setMagicUploadedState: (state: boolean) => void;
}

export const useMagicUploadedStore = create<MagicUploadedStateType>((set) => ({
  magicUploadedState: false,
  setMagicUploadedState: (state) => set({ magicUploadedState: state }),
}));
