import { create } from "zustand";

export interface SelectionPath {
  id: string;
  type: "freehand" | "rubber" | "rectangle" | "point2point";
  points: number[][];
}

interface SelectionPathsState {
  paths: SelectionPath[];
  setPaths: (paths: SelectionPath[]) => void;
  addPath: (path: SelectionPath) => void;
  removePath: (id: string) => void;
  clearPaths: () => void;
}

export const useSelectionPathsStore = create<SelectionPathsState>((set) => ({
  paths: [],
  setPaths: (paths) => set({ paths }),
  addPath: (path) => set((state) => ({ paths: [...state.paths, path] })),
  removePath: (id) => set((state) => ({ paths: state.paths.filter((path) => path.id !== id) })),
  clearPaths: () => set({ paths: [] }),
}));
