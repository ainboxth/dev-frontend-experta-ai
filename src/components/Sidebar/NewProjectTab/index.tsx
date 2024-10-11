import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Select,
  SelectItem,
  Slider,
  Textarea,
} from "@nextui-org/react";
import Upload from "@/components/Upload";
import { dataInDropdown } from "./dataInDropdown";
import generateImage from "@/services/generateImage";
import { useImangePreviewStore } from "@/store/imagePreviewStoer";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useLoadingState } from "@/store/loadingState";
import convertToBase64 from "@/utils/encodeFileImageToBase64";
import { getTimeStampStr } from "@/utils/getTimeStamp";
import CustomModal from "@/components/CustomModal";
import CustomSlider from "@/components/CustomSliderBar";

const NewProjectTab = () => {
  const [imageType, setImageType] = useState("");
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [textPrompt, setTextPrompt] = useState("");
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const { originalFile } = useImangePreviewStore();
  const { responseImage, setResponseImage, onResetResponseImageData } =
    useImangeResponseStore();
  const { setIsLoadingWaitingResponse } = useLoadingState();
  const [imageBase64ForSentToBackend, setImageBase64ForSentToBackend] =
    useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState<number>(0.5);

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
    let parts = [];
    if (imageType) parts.push(`a(n) ${imageType}`);
    else parts.push("an");
    if (roomType) parts.push(`${roomType} room`);
    else parts.push("room");
    if (style) parts.push(`in the ${style} style`);
    if (textPrompt) parts.push(`featuring ${textPrompt}`);
    if (removeFurniture) parts.push("No Furniture");

    const promp = `Create ${parts.join(" ")}.`;

    try {
      setIsLoadingWaitingResponse(true);
      const response = await generateImage(
        imageBase64ForSentToBackend,
        getTimeStampStr(),
        promp,
        sliderValue
      );
      let parsedResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("Error parsing response JSON:", error);
          return;
        }
      } else {
        parsedResponse = response;
      }
      if (parsedResponse && Array.isArray(parsedResponse.images)) {
        setResponseImage(parsedResponse.images);
        setIsLoadingWaitingResponse(false);
      } else {
        setIsModalOpen(true);
        setIsLoadingWaitingResponse(false);
      }
    } catch (error) {
      setIsModalOpen(true);
      setIsLoadingWaitingResponse(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "95%",
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
        // style={{ resize: "none" }}
        style={{ borderRadius: "8px" }}
      />

      <span>
        <strong> Denoising strength </strong> <br />
        &nbsp; Controls how much the image changes. <br />
        &nbsp; Lower keeps more of the original.
      </span>

      <CustomSlider
        step={0.1}
        maxValue={1}
        minValue={0}
        thumbSize={16}
        height={8}
        defaultValue={sliderValue}
        onChange={handleSliderChange}
      />

      <Button
        onClick={() => {
          handleSubmit();
        }}
        color="warning"
        className="text-black font-bold"
        style={{
          height: "40px",
          width: "100%",
          borderRadius: "8px",
        }}
        size="md"
      >
        Generate
      </Button>

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
