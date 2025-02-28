import React, { useState } from "react";
import { Button, Select, Textarea, SelectItem, Input } from "@nextui-org/react";
import { useImangePreviewStore } from "@/store/magicImagePreviewStore";
import { useImangeResponseStore } from "@/store/magicImageResponseStore";
import { useLoadingState } from "@/store/loadingState";
import { useMagicGeneratedStore } from "@/store/magicGeneratedState";
import { useMagicUploadedStore } from "@/store/magicUploadedState";
import { useImageHistoryStore } from "@/store/magicImageHistoryStore";
import MagicUpload from "@/components/Upload/magicUpload";
import convertToBase64 from "@/utils/encodeFileImageToBase64";
import { useSelectionPathsStore } from "@/store/selectionPathStore";
import { generateOutputImage } from "@/utils/imageProcessing";
import SelectionTools from "./component/SelectionTools";
import ColorPicker from "./component/ColorPicker";
import MaterialPicker from "./component/MeterialPicker";
// import TerminalPrompt from "./component/TerminalPrompt";
// import { ConfigPage } from "@/utils/config";
import { magicGenerateImage, magicRemoveMask } from "@/services/generateImage";
import { generateOutputImage_OpenAI } from "@/utils/imageProcessing/mask_open_ai";

interface MagicEditTabProps {
  selectedTool: "freehand" | "rubber" | "rectangle" | "point2point";
  setSelectedTool: React.Dispatch<
    React.SetStateAction<"freehand" | "rubber" | "rectangle" | "point2point">
  >;
}

const MagicEditTab: React.FC<MagicEditTabProps> = ({
  selectedTool,
  setSelectedTool,
}) => {
  const { setPreviewImageV2, setOriginalFileV2 } = useImangePreviewStore();
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
  const {
    imageHistory,
    currentImageIndex,
    addImage,
    setCurrentIndex,
    resetHistory,
  } = useImageHistoryStore();

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

  const handleEditOptionChange = (value: string) => {
    // Reset all values when changing options
    resetPrompt();
    // Close any open pickers
    setIsColorPickerOpen(false);
    setIsMaterialPickerOpen(false);
    // Set the new edit option
    setEditOption(value);
  };

  const handleColorSelect = (hexCode: string) => {
    setSelectedColor(hexCode);
    setIsColorPickerOpen(false);
  };

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material);
    setIsMaterialPickerOpen(false);
  };

  const getCombinedPrompt = () => {
    let combined = userPrompt;
    if (selectedColor) combined += ` Color: ${selectedColor}`;
    if (selectedMaterial) combined += ` Material: ${selectedMaterial}`;
    return combined;
  };

  const handleRemove = async () => {
    if (imageHistory.length > 0 && currentImageIndex >= 0) {
      setIsLoadingWaitingResponse(true);
      try {
        const image_base64 = await generateOutputImage(
          paths,
          imageHistory[currentImageIndex]
        );
        const maskBase64 = image_base64.split(",")[1];
        const imageBase64 = imageHistory[currentImageIndex];

        const responseImage = await magicRemoveMask(imageBase64, maskBase64);

        setMagicGeneratedState(true);
        updateImageUpload(responseImage[0]);
      } catch (error) {
        console.error("Error generating output image:", error);
      } finally {
        setIsLoadingWaitingResponse(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (imageHistory.length > 0 && currentImageIndex >= 0) {
      setIsLoadingWaitingResponse(true);
      try {
        const image_base64 = await generateOutputImage(
          paths,
          imageHistory[currentImageIndex]
        );

        const maskBase64 = image_base64.split(",")[1];
        const imageBase64 = imageHistory[currentImageIndex];
        const responseImage = await magicGenerateImage(
          getCombinedPrompt(),
          imageBase64,
          maskBase64,
          `image_${currentImageIndex}.png`,
          selectedColor
        );

        setMagicGeneratedState(true);
        updateImageUpload(responseImage[0]);
      } catch (error) {
        console.error("Error generating output image:", error);
      } finally {
        setIsLoadingWaitingResponse(false);
      }
    }
  };

  const updateImageUpload = (base64Image: string) => {
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    const file = new File([blob], "generated_image.png", {
      type: "image/png",
    });

    setOriginalFileV2(file);
    setPreviewImageV2([URL.createObjectURL(file)]);
    setResponseImageV2([base64Image]);
    setMagicUploadedState(true);
    addImage(base64Image);
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentIndex(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < imageHistory.length - 1) {
      setCurrentIndex(currentImageIndex + 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "100%",
        height: "100%",
        position: "relative",
        // paddingBottom: "70px", // Add padding to account for fixed button
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        <MagicUpload
          onUploadComplete={(file) => {
            setMagicUploadedState(true);
            convertToBase64(file).then((base64) => {
              resetHistory();
              addImage(base64);
            });
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Button onClick={handlePrevious} disabled={currentImageIndex <= 0}>
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentImageIndex >= imageHistory.length - 1}
          >
            Next
          </Button>
        </div>

        <SelectionTools
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "65%",
                marginRight: "4px",
              }}
            >
              <Select
                variant="faded"
                label="Option"
                labelPlacement="outside"
                placeholder="Select an option"
                value={editOption}
                size="md"
                onChange={(e) => handleEditOptionChange(e.target.value)}
                style={{ borderRadius: "8px" }}
              >
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

            <div
              style={{ display: "flex", flexDirection: "column", width: "35%" }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  color: "white",
                  marginBottom: "4px",
                }}
              >
                Magic Eraser
              </label>
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
                isDisabled={!paths.length}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        {editOption === "changeColor" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Input
              type="text"
              label="Color"
              placeholder="Click to choose a color"
              value={selectedColor}
              onClick={() => setIsColorPickerOpen(true)}
              readOnly
              style={{ flex: 1 }}
            />
            <Button size="sm" color="warning" onClick={resetColor}>
              Reset
            </Button>
          </div>
        )}

        {isColorPickerOpen && <ColorPicker onColorSelect={handleColorSelect} />}

        {editOption === "editMaterials" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Input
              type="text"
              label="Material"
              placeholder="Click to choose a material"
              value={selectedMaterial}
              onClick={() => setIsMaterialPickerOpen(true)}
              readOnly
              style={{ flex: 1 }}
            />
            <Button size="sm" color="warning" onClick={resetMaterial}>
              Reset
            </Button>
          </div>
        )}

        {isMaterialPickerOpen && (
          <MaterialPicker onMaterialSelect={handleMaterialSelect} />
        )}

        {editOption !== "editMaterials" && editOption !== "changeColor" ? (
          <Textarea
            label="Text Prompt"
            labelPlacement="outside"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            minRows={4}
            size="md"
            variant="faded"
            isDisabled={
              editOption === "editMaterials" || editOption === "changeColor"
            }
          />
        ) : null}
      </div>

      <div
        style={{
          position: "sticky",
          bottom: "0px",
          width: "100%",
          left: "0",
          // padding: "10px 0",
          backgroundColor: "#181A1B",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          onClick={handleGenerate}
          color="warning"
          className="text-black"
          style={{
            height: "40px",
            width: "100%",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          size="md"
          isDisabled={
            !paths.length ||
            (editOption === "changeColor" && selectedColor === "")
          }
        >
          Generate
        </Button>
      </div>
    </div>
  );
};

export default MagicEditTab;
