import { create } from "zustand";

interface ImageHistoryState {
  imageHistory: string[];
  currentImageIndex: number;
  addImage: (image: string) => void;
  setCurrentIndex: (index: number) => void;
  resetHistory: () => void;
}

export const useImageHistoryStore = create<ImageHistoryState>((set) => ({
  imageHistory: [],
  currentImageIndex: -1,

  addImage: (image: string) =>
    set((state) => ({
      imageHistory: [...state.imageHistory, image],
      currentImageIndex: state.imageHistory.length,
    })),

  setCurrentIndex: (index: number) => set({ currentImageIndex: index }),

  resetHistory: () => set({ imageHistory: [], currentImageIndex: -1 }),
}));
