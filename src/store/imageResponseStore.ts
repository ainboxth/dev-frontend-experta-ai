import { create } from "zustand";

interface FileState {
  responseImage: string[] | undefined;
  listImageBeforeShowOne: string[];
  setListImageBeforeShowOne: (image: string[]) => void;
  setResponseImage: (image: string[] | undefined) => void;
  onResetResponseImageData: () => void;
}

export const useImangeResponseStore = create<FileState>((set, get) => ({
  responseImage: [],
  listImageBeforeShowOne: [],
  setListImageBeforeShowOne: (image) => {
    set({ listImageBeforeShowOne: image });
  },
  setResponseImage: (image) => {
    console.log("Setting responseImage to:", image);
    set({ responseImage: image });
    console.log("Updated responseImage state:", get().responseImage);
  },
  onResetResponseImageData: () => {
    console.log("Resetting responseImage to an empty array");
    set({ responseImage: [] });
    set({ listImageBeforeShowOne: [] });
    console.log("Updated responseImage state:", get().responseImage);
  },
}));
