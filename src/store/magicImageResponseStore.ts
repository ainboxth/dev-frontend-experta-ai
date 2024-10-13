import { create } from "zustand";

interface FileState {
  responseImageV2: string[] | undefined;
  setResponseImageV2: (image: string[] | undefined) => void;
  onResetResponseImageDataV2: () => void;
}

export const useImangeResponseStore = create<FileState>((set, get) => ({
  responseImageV2: [],
  setResponseImageV2: (image) => {
    console.log("Setting responseImage to:", image);
    set({ responseImageV2: image });
    console.log("Updated responseImage state:", get().responseImageV2);
  },
  onResetResponseImageDataV2: () => {
    console.log("Resetting responseImage to an empty array");
    set({ responseImageV2: [] });
    console.log("Updated responseImage state:", get().responseImageV2);
  },
}));
