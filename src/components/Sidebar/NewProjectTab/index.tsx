import React, { useEffect, useState } from "react";
import { Button, Checkbox, divider, image, Select, SelectItem, Slider, Textarea } from "@nextui-org/react";
import Upload from "@/components/Upload/upload";
import { dataInDropdown } from "./dataInDropdown";
import { useImangePreviewStore } from "@/store/imagePreviewStore";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useLoadingState } from "@/store/loadingState";
import convertToBase64 from "@/utils/encodeFileImageToBase64";
import { getTimeStampStr } from "@/utils/getTimeStamp";
import CustomModal from "@/components/CustomModal";
import CustomSlider from "@/components/CustomSliderBar";
import { ArrowRotateLeft } from "iconsax-react";
import { useGenerateClickStore } from "@/store/generateClickState";
import { normalGenerateImage } from "@/services/generateImage";

const NewProjectTab = () => {
  const [imageType, setImageType] = useState("");
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [textPrompt, setTextPrompt] = useState("");
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const { originalFile } = useImangePreviewStore();
  const { responseImage, setResponseImage, onResetResponseImageData } = useImangeResponseStore();
  const { setIsLoadingWaitingResponse } = useLoadingState();
  const [imageBase64ForSentToBackend, setImageBase64ForSentToBackend] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState<number>(8);

  const [lastImageBase64, setLastImageBase64] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastSliderValue, setLastSliderValue] = useState(0.5);
  // const [clickGenImage, setClickGenImage] = useState(false);
  const { generateClickState, setGenerateClickState } = useGenerateClickStore();

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  useEffect(() => {
    const convertFileToBase64 = async () => {
      if (originalFile) {
        const base64String = await convertToBase64(originalFile);
        setImageBase64ForSentToBackend(base64String);
      }
    };
    convertFileToBase64();
  }, [originalFile]);

  const handleSubmit = async () => {
    setGenerateClickState(true);
    let parts = [];
    if (imageType) parts.push(`a(n) ${imageType}`);
    else parts.push("an");
    if (roomType) parts.push(`${roomType} room types`);
    else parts.push("room");
    if (style) parts.push(`in the ${style} style`);
    if (textPrompt) parts.push(`featuring ${textPrompt}`);
    if (removeFurniture) parts.push("No Furniture");

    const promp = `Create ${parts.join(" ")}.`;

    try {
      setIsLoadingWaitingResponse(true);
      const response = await normalGenerateImage(imageBase64ForSentToBackend, getTimeStampStr(), promp, sliderValue);
      
      if (response.length > 0) {
        console.log(response);
        
        setResponseImage(response);
        setLastImageBase64(imageBase64ForSentToBackend);
        setLastPrompt(imageType + roomType + style + textPrompt);
        setLastSliderValue(sliderValue);

        setIsLoadingWaitingResponse(false);
      } else {
        setIsModalOpen(true);
        console.log("Error generating output image");
      }
    } catch (error) {
      setIsModalOpen(true);
      setIsLoadingWaitingResponse(false);
      console.log("Error generating output image:", error);
    }
  };

  const isValuesChanged = lastImageBase64 !== imageBase64ForSentToBackend || imageType + roomType + style + textPrompt !== lastPrompt || sliderValue !== lastSliderValue;

  // useEffect(() => {
  //   console.log("clickGenImage ", clickGenImage);
  // }, [clickGenImage]);

  const DisplayButtonGennerate = () => {
    return isValuesChanged || !generateClickState ? (
      <Button
        onClick={handleSubmit}
        color="warning"
        className="text-black"
        style={{
          height: "40px",
          width: "100%",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
        size="md"
      >
        Generate
      </Button>
    ) : (
      <Button
        onClick={handleSubmit}
        color="warning"
        className="text-black font-bold"
        style={{
          height: "40px",
          width: "100%",
          borderRadius: "8px",
        }}
        size="md"
      >
        <div style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
          <ArrowRotateLeft size="18" color="#000" />
          <span style={{ marginLeft: "5px" }}> Generate </span>
        </div>
      </Button>
    );
  };

  return (
    <div
      style={{
        gap: "15px",
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        flexDirection: "column",
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        <div
          style={{
            gap: "15px",
            width: "100%",
            height: "100%",
            display: "flex",
            overflow: "auto",
            paddingBottom: "120px",
            flexDirection: "column",
            backgroundColor: "#181A1B",
          }}
        >
          <Upload />

          <Select
            variant="faded"
            label="Image Type"
            labelPlacement="outside"
            placeholder=" "
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            size="md"
            style={{ borderRadius: "8px" }}
          >
            {dataInDropdown.imageTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>

          <Select
            variant="faded"
            label="Room Type"
            labelPlacement="outside"
            placeholder=" "
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            size="md"
            style={{ borderRadius: "8px" }}
          >
            {dataInDropdown.roomTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>

          <Select
            variant="faded"
            label="Style"
            labelPlacement="outside"
            placeholder=" "
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            size="md"
            style={{ borderRadius: "8px" }}
          >
            {dataInDropdown.styles.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </Select>

          <Textarea
            placeholder=" "
            label="Text Prompt"
            labelPlacement="outside"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            minRows={6}
            size="lg"
            height={"100px"}
            variant="faded"
            style={{ borderRadius: "8px" }}
          />

          <span>
            <strong> Denoising strength </strong> <br />
            &nbsp; Controls how much the image changes. <br />
            &nbsp; Lower keeps more of the original.
          </span>

          <CustomSlider
            step={0.01}
            maxValue={10}
            minValue={6}
            thumbSize={16}
            height={8}
            defaultValue={sliderValue}
            onChange={handleSliderChange}
          />

        </div>
      </div>

      <div
        style={{
          position: "sticky",
          bottom: "0px",
          left: "0",
          paddingTop: "15px",
          backgroundColor: "#181A1B",
          zIndex: 1000,
        }}
      >
        <DisplayButtonGennerate />
      </div>

      <CustomModal
        title="Sorry"
        content={<div> Something went wrong please try again later</div>}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NewProjectTab;
