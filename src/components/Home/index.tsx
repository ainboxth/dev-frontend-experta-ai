"use client";

import Sidebar from "@/components/Sidebar";
import { Button } from "@nextui-org/react";
import { ArrowLeft2, ArrowRight2, Trash } from "iconsax-react";
import { SetStateAction, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/globals.css";
import { useImangePreviewStore } from "@/store/imagePreviewStore";
import { useImangePreviewStore as useImangePreviewStoreV2 } from "@/store/magicImagePreviewStore";
import PreviewImageModal from "@/components/PreviewImageModal";
import { useGenerateClickStore } from "@/store/generateClickState";
import deleteFolderImage from "@/utils/deleteFolderImage";
import { useCurrentWorkFolderStore } from "@/store/currentWorkFolder";
import MainImageDisplay from "@/components/MainImageDisplay";
import { downloadImages } from "@/utils/downloadPreviewImg";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useImangeResponseStore as useImangeResponseStoreV2 } from "@/store/magicImageResponseStore";
import CustomModal from "../CustomModal";
import { defaultIMGBase64 } from "../../../public/default/defaultIMG";
import { useSidebarStage } from "@/store/sidebarStage";

export default function Home() {
  const { isOpenSidebar, setIsOpenSidebar } = useSidebarStage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<"freehand" | "rubber" | "rectangle" | "point2point">("freehand");
  const { generateClickState, setGenerateClickState } = useGenerateClickStore();
  const { onresetData } = useImangePreviewStore();
  const { onresetDataV2 } = useImangePreviewStoreV2();
  const { responseImage, onResetResponseImageData } = useImangeResponseStore();
  const { responseImageV2, onResetResponseImageDataV2 } = useImangeResponseStoreV2();
  const { currentWorkFolder, setCurrentWorkFolder } = useCurrentWorkFolderStore();

  const handleSidebarToggle = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  return (
    <section
      style={{
        height: "100%",
        width: "100%",
        paddingTop: "50px",
        padding: "1.5rem 0rem 1.5rem 0rem",
        backgroundColor: "#262829",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "start",
          justifyContent: "start",
          gap: "1rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            margin: "auto 0px",
          }}
        >
          <motion.div
            initial={{ width: "0", opacity: 0 }}
            animate={isOpenSidebar ? { width: "20rem", opacity: 1 } : { width: 0, opacity: 0 }}
            transition={{
              width: { duration: 0.3 },
              opacity: { duration: 0.5 },
            }}
            style={{
              height: "99%",
              overflow: "hidden",
              position: "relative",
              visibility: isOpenSidebar ? "visible" : "hidden",
            }}
          >
            <Sidebar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
          </motion.div>
          <div
            onClick={handleSidebarToggle}
            style={{
              height: "60px",
              width: "12px",
              borderRadius: "0 12px 12px 0",
              backgroundColor: "#ffffff50",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {isOpenSidebar ? <ArrowLeft2 size="20" color="#000" /> : <ArrowRight2 size="20" color="#000" />}
          </div>
        </div>

        <MainImageDisplay selectedTool={selectedTool} />
      </div>

      {isOpenSidebar && (
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            gap: "12px",
            padding: "24px 24px",
            backgroundColor: "#262829",
            height: "60px",
            position: "sticky",
            bottom: 0,
            left: 0,
          }}
        >
          <>
            <Button
              isIconOnly
              variant="light"
              startContent={<Trash size="28" color="#fff" />}
              onClick={() => {
                if (currentWorkFolder !== "") {
                  deleteFolderImage(currentWorkFolder);
                }
                onresetData();
                onresetDataV2();
                setGenerateClickState(false);
                setCurrentWorkFolder("");
                onResetResponseImageData();
                onResetResponseImageDataV2();
              }}
            />
            {responseImage && responseImage.length > 0 && (
              <Button
                onClick={() => {
                  downloadImages(responseImage);
                }}
                style={{
                  backgroundColor: "#C5C5C5",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                Download
              </Button>
            )}
            {responseImageV2 && responseImageV2.length > 0 && (
              <Button
                onClick={() => {
                  downloadImages(responseImageV2);
                }}
                style={{
                  backgroundColor: "#C5C5C5",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                Download
              </Button>
            )}
            <Button style={{ color: "#000", fontWeight: "bold" }} color="warning">
              Save
            </Button>
          </>
        </div>
      )}
      {/* <CustomModal
        title="Sorry"
        content={<div> Can't download empty image please generateImage again</div>}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}
    </section>
  );
}
