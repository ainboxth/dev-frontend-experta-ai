import { create } from "zustand";

interface SelectionTabType {
  tab: "newProject" | "magicEdit";
  setTab: (tab: "newProject" | "magicEdit") => void;
  defaultTab: () => void;
}

export const useSelectionTab = create<SelectionTabType>((set) => ({
  tab: "newProject",
  setTab: (tab: "newProject" | "magicEdit") => set({ tab }),
  defaultTab: () => set({ tab: "newProject" }),
}));
