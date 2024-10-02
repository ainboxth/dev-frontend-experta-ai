"use client";

import React, { useState, useEffect, use } from "react";
import PreviewImageModal from "../PreviewImageModal";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useImangePreviewStore } from "@/store/imagePreviewStoer";
import { useGenerateClickStore } from "@/store/generateClickState";
import { useLoadingState } from "@/store/loadingState";
import { Skeleton } from "@nextui-org/react";
import LoadingWaitingImage from "../Loading/LoadingWaitingImage";
import SrcImgForRender from "@/utils/srcImgForRender";
import { defaultIMGBase64 } from "../../../public/default/defaultIMG";

interface MainImageDisplayType {}

const MainImageDisplay: React.FC<MainImageDisplayType> = () => {
  const defaultImage = defaultIMGBase64;
  const { responseImage } = useImangeResponseStore();
  const { previewImage } = useImangePreviewStore();

  const [isOpenShowImageModal, setIsOpenShowImageModal] = useState(false);
  const [imageShowInModal, setImageShowInModal] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([defaultImage]);
  const { isLoadingWaitingResponse, setIsLoadingWaitingResponse } =
    useLoadingState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setContainerWidth(window.innerWidth);

      const handleResize = () => setContainerWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    console.log("imagePaths", imagePaths);
  }, [imagePaths]);

  useEffect(() => {
    if (responseImage && responseImage.length > 0) {
      setImagePaths(responseImage);
    } else if (previewImage && previewImage.length > 0) {
      setImagePaths(previewImage) 
    } else {
      setImagePaths([defaultImage]);
    }
  }, [responseImage, previewImage]);

  const handleImageClick = (imagePath: string) => {
    setImageShowInModal(imagePath);
    setIsOpenShowImageModal(true);
  };

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        border: "2px solid #ffffff10",
        height: "100%",
        marginRight: "24px",
        borderRadius: "8px",
        overflow: "hidden",
        marginTop: "auto",
        marginBottom: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          height: "100%",
          maxWidth: "80%",
          margin: "0 auto",
          alignContent: "center",
          gap: "10px",
        }}
      >
        {isLoadingWaitingResponse && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <LoadingWaitingImage />
            </div>
          </div>
        )}

        {!isLoadingWaitingResponse && (
          <>
            {imagePaths.length === 1 ? (
              <img
                onClick={() => handleImageClick(imagePaths[0])}
                // src={imagePaths[0]}
                src={SrcImgForRender(imagePaths[0])}
                alt="Single Image"
                style={{
                  maxWidth: "120%",
                  maxHeight: "100%",
                  objectFit: "scale-down",
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <>
                {imagePaths.map((path, index) => (
                  <img
                    key={index}
                    onClick={() => handleImageClick(path)}
                    // src={`data:image/jpeg;base64,${path}`}
                    src={SrcImgForRender(path)}
                    alt={`Image ${index + 1}`}
                    style={{
                      width: "calc(50% - 5px)",
                      maxHeight: "calc(50% - 5px)",
                      objectFit: "scale-down",
                      cursor: "pointer",
                      borderRadius: "8px",
                      marginBottom: index < 2 ? "0" : "10px",
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}

        {isOpenShowImageModal && imageShowInModal && (
          <PreviewImageModal
            imgURL={imageShowInModal}
            isOpen={isOpenShowImageModal}
            setIsOpen={setIsOpenShowImageModal}
          />
        )}
      </div>
    </div>
  );
};

export default MainImageDisplay;
