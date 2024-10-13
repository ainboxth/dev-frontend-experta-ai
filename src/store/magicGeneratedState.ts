import { create } from "zustand";

interface MagicGeneratedStateType {
  magicGeneratedState: boolean;
  setMagicGeneratedState: (state: boolean) => void;
}

export const useMagicGeneratedStore = create<MagicGeneratedStateType>((set) => ({
  magicGeneratedState: false,
  setMagicGeneratedState: (state) => set({ magicGeneratedState: state }),
}));
