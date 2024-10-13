import React, { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import NewProjectTab from "./NewProjectTab";
import MagicEditTab from "./MagicEditTab";
import { useSelectionTab } from "@/store/selectionTab";

interface SidebarProps {
  selectedTool: "freehand" | "rubber" | "rectangle" | "point2point";
  setSelectedTool: React.Dispatch<React.SetStateAction<"freehand" | "rubber" | "rectangle" | "point2point">>;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTool, setSelectedTool }) => {
  const [activeTab, setActiveTab] = useState("newProject");
  const { setTab } = useSelectionTab();

  const handleTabChange = (key: string) => {
    if (key === "newProject" || key === "magicEdit") {
      setActiveTab(key);
      setTab(key);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#181A1B",
        color: "white",
        height: "100%",
        width: "100%",
        padding: "1rem",
        borderRadius: "0px 0.5rem 0.5rem 0px",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        fontSize: "0.9em",
      }}
    >
      <Tabs aria-label="Sidebar Tabs" onSelectionChange={(key) => handleTabChange(key.toString())} color="warning" variant="solid" fullWidth size="md" className="custom-tabs">
        <Tab key="newProject" title="New Project" />
        <Tab key="magicEdit" title="Magic Edit" />
      </Tabs>

      <div
        style={{
          flex: 1,
          height: "100%",
          marginTop: "10px",
          overflow: "auto",
        }}
      >
        {activeTab === "newProject" && <NewProjectTab />}
        {activeTab === "magicEdit" && <MagicEditTab selectedTool={selectedTool} setSelectedTool={setSelectedTool} />}
      </div>
    </div>
  );
};

export default Sidebar;
