import { create } from "zustand";

interface FileState {
  previewImageV2: string[];
  originalFileV2: File | null;
  isOldImageSameNewImageV2: boolean;
  isLoadingWaitingResponseV2: boolean;
  setPreviewImageV2: (listimage: string[]) => void;
  setOriginalFileV2: (file: File | null) => void;
  setIsOldImageSameNewImageV2: (value: boolean) => void;
  setIsLoadingWaitingResponseV2: (value: boolean) => void;
  onresetDataV2: () => void;
}

export const useImangePreviewStore = create<FileState>((set) => ({
  previewImageV2: [],
  originalFileV2: null,
  isOldImageSameNewImageV2: false,
  isLoadingWaitingResponseV2: false,
  setPreviewImageV2: (listimage) => set({ previewImageV2: listimage ?? [] }),
  setOriginalFileV2: (file) => set({ originalFileV2: file }),
  setIsOldImageSameNewImageV2: (value) => set({ isOldImageSameNewImageV2: value }),
  setIsLoadingWaitingResponseV2: (value) => set({ isLoadingWaitingResponseV2: value }),
  onresetDataV2: () => set({ previewImageV2: [], originalFileV2: null }),
}));
