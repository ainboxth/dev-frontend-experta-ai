import { create } from "zustand";

interface SelectionPathsState {
  paths: Array<{ type: "freehand" | "rubber" | "rectangle" | "point2point"; points: number[][] }>;
  setPaths: (paths: Array<{ type: "freehand" | "rubber" | "rectangle" | "point2point"; points: number[][] }>) => void;
  clearPaths: () => void;
}

export const useSelectionPathsStore = create<SelectionPathsState>((set) => ({
  paths: [],
  setPaths: (paths) => set({ paths }),
  clearPaths: () => set({ paths: [] }),
}));
