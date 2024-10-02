import { create } from "zustand";

interface FileState {
  responseImage: string[] | undefined;
  setResponseImage: (image: string[] | undefined) => void;
  onResetResponseImageData: () => void;
}

export const useImangeResponseStore = create<FileState>((set, get) => ({
  responseImage: [],
  setResponseImage: (image) => {
    console.log("Setting responseImage to:", image);
    set({ responseImage: image });
    console.log("Updated responseImage state:", get().responseImage);
  },
  onResetResponseImageData: () => {
    console.log("Resetting responseImage to an empty array");
    set({ responseImage: [] });
    console.log("Updated responseImage state:", get().responseImage);
  },
}));