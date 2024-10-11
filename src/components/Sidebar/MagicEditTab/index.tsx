import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Button, Modal, Select, Textarea, SelectItem, Input } from "@nextui-org/react";
import { useImangePreviewStore } from "@/store/imagePreviewStoer";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useLoadingState } from "@/store/loadingState";
import { useGenerateClickStore } from "@/store/generateClickState";
import Upload from "@/components/Upload";
import convertToBase64 from "@/utils/encodeFileImageToBase64";
import { useSelectionPathsStore } from "@/store/selectionPathStore";
import { generateOutputImage } from "@/utils/imageProcessing";
import SelectionTools from "./component/SelectionTools";
import ColorPicker from "./component/ColorPicker";
import MaterialPicker from "./component/MeterialPicker";

interface MagicEditTabProps {
  selectedTool: "freehand" | "rubber" | "rectangle" | "point2point";
  setSelectedTool: React.Dispatch<React.SetStateAction<"freehand" | "rubber" | "rectangle" | "point2point">>;
}

const MagicEditTab: React.FC<MagicEditTabProps> = ({ selectedTool, setSelectedTool }) => {
  const { previewImage, originalFile } = useImangePreviewStore();
  const { setResponseImage } = useImangeResponseStore();
  const { setIsLoadingWaitingResponse } = useLoadingState();
  const { setGenerateClickState } = useGenerateClickStore();
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const { paths } = useSelectionPathsStore();
  const [prompt, setPrompt] = useState<string>("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [editOption, setEditOption] = useState<string>("");

  const handleGenerate = async () => {
    if (previewImage && previewImage.length > 0 && originalFile) {
      setIsLoadingWaitingResponse(true);
      try {
        const image_base64 = await generateOutputImage(paths, previewImage[0]);
        const base64Data = image_base64.split(",")[1];
        const base64Image = await convertToBase64(originalFile);
        setRenderedImage(`${base64Data}`);
        const response = await axios.post("https://boar-magnetic-happily.ngrok-free.app/remove_mask", {
          // prompt: "change pillow color to red",
          image_base64: base64Image,
          // img_name: originalFile.name,
          mask_base64: base64Data,
        });
        console.log("Response from server:", response);

        if (response.status === 200) {
          const outputImage = response.data.images[0];
          console.log("Output image received:", outputImage);
          // setResponseImage([outputImage]);
          setRenderedImage(`${outputImage}`);
          console.log("Response image set to:", outputImage);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error generating output image:", error);
        // Handle error (e.g., show an error message to the user)
      } finally {
        setIsLoadingWaitingResponse(false);
      }
    }
  };

  const handleColorSelect = (hexCode: string) => {
    setSelectedColor(hexCode);
    setIsColorPickerOpen(false);
  };

  const handleEditOptionChange = (value: string) => {
    // Clear states when changing options
    setSelectedColor("");
    setSelectedMaterial("");
    setIsColorPickerOpen(false);
    setIsMaterialPickerOpen(false);
    setEditOption(value);
  };

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material);
    setIsMaterialPickerOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "95%" }}>
      <Upload onUploadComplete={() => setGenerateClickState(true)} />

      <SelectionTools selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

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
              onClick={handleGenerate}
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

      {editOption === "changeColor" && <Input type="text" label="Color" placeholder="Click to choose a color" value={selectedColor} onClick={() => setIsColorPickerOpen(true)} readOnly />}

      {isColorPickerOpen && <ColorPicker onColorSelect={handleColorSelect} />}

      {editOption === "editMaterials" && <Input type="text" label="Material" placeholder="Click to choose a material" value={selectedMaterial} onClick={() => setIsMaterialPickerOpen(true)} readOnly />}

      {isMaterialPickerOpen && <MaterialPicker onMaterialSelect={handleMaterialSelect} />}

      <Textarea placeholder=" " label="Text Prompt" labelPlacement="outside" value={prompt} onChange={(e) => setPrompt(e.target.value)} minRows={4} size="md" variant="faded" />

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

      {renderedImage && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Image:</h3>
          <img src={`data:image/png;base64,${renderedImage}`} alt="Generated" style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      )}
    </div>
  );
};

export default MagicEditTab;
