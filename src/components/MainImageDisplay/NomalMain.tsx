"use client";

import React, { useState, useEffect, use } from "react";
import PreviewImageModal from "../PreviewImageModal";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useImangePreviewStore } from "@/store/imagePreviewStore";
import { useLoadingState } from "@/store/loadingState";
import { Skeleton } from "@nextui-org/react";
import LoadingWaitingImage from "../Loading/LoadingWaitingImage";
import SrcImgForRender from "@/utils/srcImgForRender";
import { defaultIMGBase64 } from "../../../public/default/defaultIMG";
import { useSidebarStage } from "@/store/sidebarStage";
import Image from "next/image";
import { motion } from "framer-motion";
import getImageAnimation from "@/utils/getImageAnimationView";

interface MainImageDisplayType {}

const NomalMainImageDisplay: React.FC<MainImageDisplayType> = () => {
  const defaultImage = defaultIMGBase64;
  const { previewImage } = useImangePreviewStore();
  const { isOpenSidebar } = useSidebarStage();
  const [isOpenShowImageModal, setIsOpenShowImageModal] = useState(false);
  const [imageShowInModal, setImageShowInModal] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([defaultImage]);
  const { isLoadingWaitingResponse } = useLoadingState();
  const [reverseAnimation, setReverseAnimation] = useState(false);
  const { responseImage, listImageBeforeShowOne, setListImageBeforeShowOne } =
    useImangeResponseStore();
  const [location4ImageTo1ForMotion, setLocation4ImageTo1ForMotion] = useState<
    number | null
  >(null);

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

  // const handleImageClick = (imagePath: string) => {
  //   setImageShowInModal(imagePath);
  //   setIsOpenShowImageModal(true);
  // };

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageClick = (imagePath: string) => {
    setImagePaths([imagePath]);
    setListImageBeforeShowOne(imagePaths);
    setLocation4ImageTo1ForMotion(imagePaths.indexOf(imagePath));
    setReverseAnimation(false);
  };

  const handleBackTo4Images = () => {
    setReverseAnimation(true);
    setTimeout(() => {
      setImagePaths(listImageBeforeShowOne);
    }, 500);
  };

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
              <motion.div
                key={reverseAnimation ? "reverse" : imagePaths[0]}
                style={{
                  position: "relative",
                  width: "fit-content",
                  height: "100%",
                  borderRadius: "8px",
                }}
                initial={getImageAnimation(
                  location4ImageTo1ForMotion,
                  reverseAnimation
                )}
                animate={
                  reverseAnimation
                    ? { x: 0, y: 0, opacity: 0, scale: 1 }
                    : { x: 0, y: 0, opacity: 1, scale: 1 }
                }
                exit={
                  reverseAnimation ? { x: 0, opacity: 1 } : { x: 0, opacity: 1 }
                }
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    borderRadius: "8px",
                    backgroundColor: "#181A1B",
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
                      onClick={handleBackTo4Images}
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
              </motion.div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gridTemplateRows: "repeat(2, 1fr)",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  maxWidth: "100%",
                  margin: "auto",
                  boxSizing: "border-box",
                  height: "100%",
                }}
              >
                {imagePaths.map((path, index) => (
                  <div
                    key={index}
                    style={{
                      height: "100%",
                      overflow: "hidden",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      onClick={() => handleImageClick(path)}
                      src={SrcImgForRender(path)}
                      alt={`Image ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {isOpenShowImageModal && imageShowInModal && <PreviewImageModal imgURL={imageShowInModal} isOpen={isOpenShowImageModal} setIsOpen={setIsOpenShowImageModal} />}
      </div>
    </div>
  );
};

export default NomalMainImageDisplay;
