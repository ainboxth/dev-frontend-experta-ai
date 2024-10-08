import React from "react";
import { Button } from "@nextui-org/react";
import { useImangePreviewStore } from "@/store/imagePreviewStoer";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useLoadingState } from "@/store/loadingState";
import { useGenerateClickStore } from "@/store/generateClickState";
import { generateOutputImage } from "@/utils/imageProcessing";
import Upload from "@/components/Upload";

interface MagicEditTabProps {
  selectedTool: "freehand" | "rectangle";
  setSelectedTool: React.Dispatch<React.SetStateAction<"freehand" | "rectangle">>;
}

const MagicEditTab: React.FC<MagicEditTabProps> = ({ selectedTool, setSelectedTool }) => {
  const { previewImage } = useImangePreviewStore();
  const { setResponseImage } = useImangeResponseStore();
  const { setIsLoadingWaitingResponse } = useLoadingState();
  const { setGenerateClickState } = useGenerateClickStore();

  const handleGenerate = async () => {
    if (previewImage && previewImage.length > 0) {
      setIsLoadingWaitingResponse(true);
      try {
        // Note: You'll need to pass the selection paths from MainImageDisplay
        // This might require lifting the state up or using a global state management solution
        const outputImage = await generateOutputImage([], previewImage[0]);
        setResponseImage([outputImage]);
      } catch (error) {
        console.error("Error generating output image:", error);
        // Handle error (e.g., show an error message to the user)
      } finally {
        setIsLoadingWaitingResponse(false);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "95%" }}>
      <Upload onUploadComplete={() => setGenerateClickState(true)} />

      <div>
        <Button onClick={() => setSelectedTool("freehand")} color={selectedTool === "freehand" ? "warning" : "default"}>
          Freehand
        </Button>
        <Button onClick={() => setSelectedTool("rectangle")} color={selectedTool === "rectangle" ? "warning" : "default"}>
          Rectangle
        </Button>
      </div>

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
