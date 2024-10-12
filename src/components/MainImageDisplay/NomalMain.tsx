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
import { useSidebarStage } from "@/store/sidebarStage";
import Image from "next/image";

interface MainImageDisplayType {}

const NomalMainImageDisplay: React.FC<MainImageDisplayType> = () => {
  const defaultImage = defaultIMGBase64;
  const { responseImage, listImageBeforeShowOne, setListImageBeforeShowOne } =
    useImangeResponseStore();
  const { previewImage } = useImangePreviewStore();
  const { isOpenSidebar } = useSidebarStage();

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
      setImagePaths(previewImage);
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
          width: "100%",
          margin: "0 auto",
          alignContent: "center",
          gap: "10px",
          borderRadius: "8px",
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
              <div
                style={{
                  position: "relative",
                  width: "fit-content",
                  height: "100%",
                  borderRadius: "8px",
                }}
              >
                {listImageBeforeShowOne.length > 0 && (
                  <button
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      zIndex: 10,
                      borderRadius: "4px",
                    }}
                    onClick={() => {
                      setImagePaths(listImageBeforeShowOne);
                    }}
                  >
                    <Image
                      src={"/icon_tools/mini_preview.svg"}
                      alt={"close preview"}
                      width={25}
                      height={25}
                      style={{
                        filter:
                          "drop-shadow(0px 0px 2px #ffffff) drop-shadow(0px 0px 0.05px #ffffff50)",
                      }}
                    />
                  </button>
                )}
                <img
                  src={SrcImgForRender(imagePaths[0])}
                  alt="Single Image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    cursor: "default",
                    borderRadius: "8px",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  margin: isOpenSidebar ? "0" : "8%",
                  borderRadius: "8px",
                }}
              >
                {imagePaths.map((path, index) => (
                  <div
                    style={{
                      width: "calc(50% - 180px)",
                      objectFit: "contain",
                      cursor: "pointer",
                      borderRadius: "8px",
                      marginBottom: index < 2 ? "0" : "10px",
                    }}
                  >
                    <img
                      key={index}
                      // onClick={() => handleImageClick(path)}
                      onClick={() => {
                        setImagePaths([path]);
                        setListImageBeforeShowOne(imagePaths);
                      }}
                      src={SrcImgForRender(path)}
                      alt={`Image ${index + 1}`}
                      style={{
                        objectFit: "contain",
                        cursor: "pointer",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                ))}
              </div>
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

export default NomalMainImageDisplay;
