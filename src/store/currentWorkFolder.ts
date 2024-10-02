import { create } from "zustand";

interface CurrentWorkFolderType {
  cerrentImagePath: string;
  currentWorkFolder: string;
  setCurrentWorkFolder: (value: string) => void;
  setCerrentImagePath: (value: string) => void;
}

export const useCurrentWorkFolderStore = create<CurrentWorkFolderType>(
  (set) => ({
    currentWorkFolder: "",
    cerrentImagePath: "",
    setCurrentWorkFolder: (value) => set({ currentWorkFolder: value }),
    setCerrentImagePath: (value) => set({ cerrentImagePath: value }),
  })
);
