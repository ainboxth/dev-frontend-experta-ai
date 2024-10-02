import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Select,
  SelectItem,
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
        promp
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "8px",
          marginBottom: "-32px",
        }}
      >
        <span style={{ fontSize: "0.9em" }}>Remove Furniture</span>
        <Checkbox
          className="checkbox"
          isSelected={removeFurniture}
          onValueChange={setRemoveFurniture}
          color="warning"
          size="md"
        />
      </div>

      <Select
        variant="faded"
        label="Image Type"
        labelPlacement="outside"
        placeholder=" "
        value={imageType}
        onChange={(e) => setImageType(e.target.value)}
        size="md"
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
        minRows={4}
        size="md"
        variant="faded"
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
