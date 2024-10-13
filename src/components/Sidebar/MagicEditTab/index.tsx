import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Select, Textarea, SelectItem, Input } from "@nextui-org/react";
import { useImangePreviewStore } from "@/store/magicImagePreviewStore";
import { useImangeResponseStore } from "@/store/magicImageResponseStore";
import { useLoadingState } from "@/store/loadingState";
import { useMagicGeneratedStore } from "@/store/magicGeneratedState";
import { useMagicUploadedStore } from "@/store/magicUploadedState";
import MagicUpload from "@/components/Upload/magicUpload";
import convertToBase64 from "@/utils/encodeFileImageToBase64";
import { useSelectionPathsStore } from "@/store/selectionPathStore";
import { generateOutputImage } from "@/utils/imageProcessing";
import SelectionTools from "./component/SelectionTools";
import ColorPicker from "./component/ColorPicker";
import MaterialPicker from "./component/MeterialPicker";
import TerminalPrompt from "./component/TerminalPrompt";

interface MagicEditTabProps {
  selectedTool: "freehand" | "rubber" | "rectangle" | "point2point";
  setSelectedTool: React.Dispatch<React.SetStateAction<"freehand" | "rubber" | "rectangle" | "point2point">>;
}

const MagicEditTab: React.FC<MagicEditTabProps> = ({ selectedTool, setSelectedTool }) => {
  const { previewImageV2, originalFileV2, setPreviewImageV2, setOriginalFileV2 } = useImangePreviewStore();
  const { setResponseImageV2 } = useImangeResponseStore();
  const { setIsLoadingWaitingResponse } = useLoadingState();
  const { setMagicGeneratedState } = useMagicGeneratedStore();
  const { setMagicUploadedState } = useMagicUploadedStore();
  const { paths } = useSelectionPathsStore();
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [editOption, setEditOption] = useState<string>("");

  const resetPrompt = () => {
    setUserPrompt("");
    setSelectedColor("");
    setSelectedMaterial("");
  };

  const resetColor = () => {
    setSelectedColor("");
  };

  const resetMaterial = () => {
    setSelectedMaterial("");
  };

  const handleRemove = async () => {
    if (previewImageV2 && previewImageV2.length > 0 && originalFileV2) {
      setIsLoadingWaitingResponse(true);
      try {
        const image_base64 = await generateOutputImage(paths, previewImageV2[0]);
        const base64CustomImage = image_base64.split(",")[1];
        const base64OriginalImage = await convertToBase64(originalFileV2);
        const response = await axios.post("https://boar-magnetic-happily.ngrok-free.app/remove_mask", {
          image_base64: base64OriginalImage,
          mask_base64: base64CustomImage,
        });

        if (response.status === 200) {
          setMagicGeneratedState(true);
          const outputImage = response.data.images[0];
          updateImageUpload(outputImage);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error generating output image:", error);
      } finally {
        setIsLoadingWaitingResponse(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (previewImageV2 && previewImageV2.length > 0 && originalFileV2) {
      setIsLoadingWaitingResponse(true);
      try {
        const image_base64 = await generateOutputImage(paths, previewImageV2[0]);
        const base64CustomImage = image_base64.split(",")[1];
        const base64OriginalImage = await convertToBase64(originalFileV2);
        const response = await axios.post("https://boar-magnetic-happily.ngrok-free.app/inpaint2img", {
          prompt: getCombinedPrompt(),
          image_base64: base64OriginalImage,
          img_name: originalFileV2.name,
          mask_base64: base64CustomImage,
        });

        if (response.status === 200) {
          setMagicGeneratedState(true);
          const outputImage = response.data.images[0]; // Assuming the first image in the array
          updateImageUpload(outputImage);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error generating output image:", error);
      } finally {
        setIsLoadingWaitingResponse(false);
      }
    }
  };

  const updateImageUpload = (base64Image: string) => {
    // Convert base64 to blob
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });

    // Create a File object
    const file = new File([blob], "generated_image.jpg", { type: "image/jpeg" });

    // Update the stores
    setOriginalFileV2(file);
    setPreviewImageV2([URL.createObjectURL(file)]);
    setResponseImageV2([base64Image]);
    setMagicUploadedState(true);
  };

  const handleColorSelect = (hexCode: string) => {
    setSelectedColor(hexCode);
    setIsColorPickerOpen(false);
  };

  const handleEditOptionChange = (value: string) => {
    setEditOption(value);
  };

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material);
    setIsMaterialPickerOpen(false);
  };

  const getCombinedPrompt = () => {
    let combined = userPrompt;
    if (selectedColor) combined += `, Color: ${selectedColor}`;
    if (selectedMaterial) combined += `, Material: ${selectedMaterial}`;
    return combined;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
      <MagicUpload onUploadComplete={() => setMagicUploadedState(true)} />

      <SelectionTools selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

      <TerminalPrompt userPrompt={userPrompt} selectedColor={selectedColor} selectedMaterial={selectedMaterial} onReset={resetPrompt} />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "65%" }}>
            <Select variant="faded" label="Option" labelPlacement="outside" placeholder="Select an option" value={editOption} size="md" onChange={(e) => handleEditOptionChange(e.target.value)}>
              <SelectItem key="editObject" value="editObject">
                Edit Object
              </SelectItem>
              <SelectItem key="editMaterials" value="editMaterials">
                Edit Materials
              </SelectItem>
              <SelectItem key="changeColor" value="changeColor">
                Change Color
              </SelectItem>
            </Select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", width: "35%" }}>
            <label style={{ fontSize: "0.875rem", color: "white", marginBottom: "4px" }}>Magic Eraser</label>
            <Button
              onClick={handleRemove}
              color="warning"
              style={{
                height: "40px",
                width: "100%",
                backgroundColor: "#FFD600",
                color: "black",
                fontWeight: "bold",
              }}
              size="sm"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      {editOption === "changeColor" && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Input type="text" label="Color" placeholder="Click to choose a color" value={selectedColor} onClick={() => setIsColorPickerOpen(true)} readOnly style={{ flex: 1 }} />
          <Button size="sm" color="warning" onClick={resetColor}>
            Reset
          </Button>
        </div>
      )}

      {isColorPickerOpen && <ColorPicker onColorSelect={handleColorSelect} />}

      {editOption === "editMaterials" && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Input type="text" label="Material" placeholder="Click to choose a material" value={selectedMaterial} onClick={() => setIsMaterialPickerOpen(true)} readOnly style={{ flex: 1 }} />
          <Button size="sm" color="warning" onClick={resetMaterial}>
            Reset
          </Button>
        </div>
      )}

      {isMaterialPickerOpen && <MaterialPicker onMaterialSelect={handleMaterialSelect} />}

      <Textarea label="Text Prompt" labelPlacement="outside" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} minRows={4} size="md" variant="faded" />

      <Button
        onClick={handleGenerate}
        color="warning"
        className="text-black font-bold"
        style={{
          height: "40px",
          width: "100%",
        }}
        size="md"
      >
        Generate
      </Button>
    </div>
  );
};

export default MagicEditTab;
