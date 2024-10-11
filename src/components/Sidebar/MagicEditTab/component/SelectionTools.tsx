import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface SelectionToolsProps {
  selectedTool: string;
  setSelectedTool: React.Dispatch<React.SetStateAction<"freehand" | "rubber" | "rectangle" | "point2point">>;
}

const SelectionTools: React.FC<SelectionToolsProps> = ({ selectedTool, setSelectedTool }) => {
  const tools = [
    { name: "freehand" as const, icon: "icon_tools/bi_brush.svg", additionalIcon: "icon_tools/mingcute_plus-fill.svg" },
    { name: "rubber" as const, icon: "icon_tools/bi_brush.svg", additionalIcon: "icon_tools/typcn_minus.svg" },
    { name: "rectangle" as const, icon: "icon_tools/mdi_selection.svg" },
    { name: "point2point" as const, icon: "icon_tools/hugeicons_lasso-tool-02.svg" },
  ];

  return (
    <div style={{ width: "100%", borderRadius: "8px" }}>
      <h2 style={{ color: "white", fontSize: "15px", marginBottom: "8px" }}>Selection Tools</h2>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {tools.map((tool) => (
          <motion.button
            key={tool.name}
            style={{
              position: "relative",
              padding: "8px",
              borderRadius: "100px",
              backgroundColor: "transparent",
              border: `2px solid ${selectedTool === tool.name ? "#efff00" : "#374151"}`,
              transition: "border-color 0.2s",
            }}
            onClick={() => setSelectedTool(tool.name)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image src={tool.icon} alt={tool.name} width={20} height={20} />
              {tool.additionalIcon && (
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#374151",
                    borderRadius: "50%",
                  }}
                >
                  <Image src={tool.additionalIcon} alt={`${tool.name}-additional`} width={12} height={12} />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SelectionTools;
