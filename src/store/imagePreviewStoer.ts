import { create } from "zustand";

interface FileState {
  previewImage: string[];
  originalFile: File | null;
  isOldImageSameNewImage: boolean;
  isLoadingWaitingResponse: boolean;
  setPreviewImage: (listimage: string[]) => void;
  setOriginalFile: (file: File | null) => void;
  setIsOldImageSameNewImage: (value: boolean) => void;
  setIsLoadingWaitingResponse: (value: boolean) => void;
  onresetData: () => void;
}

export const useImangePreviewStore = create<FileState>((set) => ({
  previewImage: [],
  originalFile: null,
  isOldImageSameNewImage: false,
  isLoadingWaitingResponse: false,
  setPreviewImage: (listimage) => set({ previewImage: listimage ?? [] }),
  setOriginalFile: (file) => set({ originalFile: file }),
  setIsOldImageSameNewImage: (value) => set({ isOldImageSameNewImage: value }),
  setIsLoadingWaitingResponse: (value) => set({ isLoadingWaitingResponse: value }),
  onresetData: () => set({ previewImage: [], originalFile: null }),
}));
