import React, { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import NewProjectTab from "./NewProjectTab";
import MagicEditTab from "./MagicEditTab";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("newProject");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
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
      <Tabs
        aria-label="Sidebar Tabs"
        onSelectionChange={(key) => handleTabChange(key.toString())}
        color="warning"
        variant="solid"
        fullWidth
        size="md"
      >
        <Tab key="newProject" title="New Project" />
        <Tab key="magicEdit" title="Magic Edit" />
      </Tabs>

      <div
        style={{
          overflowY: "auto",
          flex:1,
          marginTop:"10px",
          marginLeft:"5%",
        }}
      >
        {activeTab === "newProject" && <NewProjectTab />}
        {activeTab === "magicEdit" && <MagicEditTab />}
      </div>
    </div>
  );
};

export default Sidebar;
