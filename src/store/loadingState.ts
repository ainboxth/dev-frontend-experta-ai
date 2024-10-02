import { create } from "zustand";

interface LoadingStateType {
  isLoadingWaitingResponse: boolean;
  setIsLoadingWaitingResponse: (value: boolean) => void;
}

export const useLoadingState = create<LoadingStateType>((set) => ({
  isLoadingWaitingResponse: false,
  setIsLoadingWaitingResponse: (value) => set({ isLoadingWaitingResponse: value }),
}));
