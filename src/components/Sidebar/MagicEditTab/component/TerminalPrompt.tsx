import React from "react";
import { Button, Card } from "@nextui-org/react";

interface TerminalPromptProps {
  userPrompt: string;
  selectedColor: string;
  selectedMaterial: string;
  onReset: () => void;
}

const TerminalPrompt: React.FC<TerminalPromptProps> = ({ userPrompt, selectedColor, selectedMaterial, onReset }) => {
  const getCombinedPrompt = () => {
    let combined = userPrompt;
    if (selectedColor) combined += `, Color: ${selectedColor}`;
    if (selectedMaterial) combined += `, Material: ${selectedMaterial}`;
    return combined.trim();
  };

  const combinedPrompt = getCombinedPrompt();

  return (
    <Card style={{ padding: "10px", marginBottom: "10px", backgroundColor: "#27272A" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#A0AEC0", wordBreak: "break-word", margin: 0 }}>{combinedPrompt || "Your prompt..."}</p>
        <Button size="sm" color="warning" onClick={onReset}>
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default TerminalPrompt;
