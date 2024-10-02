import { create } from "zustand";

interface GenerateClickStateType {
  generateClickState: boolean;
  setGenerateClickState: (state: boolean) => void;
}

export const useGenerateClickStore = create<GenerateClickStateType>((set) => ({
  generateClickState: false,
  setGenerateClickState: (state) => set({ generateClickState: state }),
}));
