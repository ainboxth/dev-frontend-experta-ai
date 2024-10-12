import { create } from "zustand";

interface SidebarStageType {
  isOpenSidebar: boolean;
  setIsOpenSidebar: (value: boolean) => void;
}

export const useSidebarStage = create<SidebarStageType>((set) => ({
  isOpenSidebar: true,
  setIsOpenSidebar: (value) => set({ isOpenSidebar: value }),
}));
