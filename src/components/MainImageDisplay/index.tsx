"use client";

import React, { useState } from "react";
import NomalMainImageDisplay from "./NomalMain";
import MagicMainImageDisplay from "./MagicMain";
import { useSelectionPathsStore } from "@/store/selectionPathStore";
import { useSelectionTab } from "@/store/selectionTab";

interface MainImageDisplayProps {
  selectedTool: "freehand" | "rubber" | "rectangle" | "point2point";
}

const MainImageDisplay: React.FC<MainImageDisplayProps> = ({
  selectedTool,
}) => {
  const { tab } = useSelectionTab();
  return (
    <div style={{ width: "100%", height: "100%" }}>
      {tab === "newProject" && <NomalMainImageDisplay />}
      {tab === "magicEdit" && (
        <MagicMainImageDisplay selectedTool={selectedTool} />
      )}
    </div>
  );
};

export default MainImageDisplay;
