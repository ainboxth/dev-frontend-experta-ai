import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@nextui-org/react";
import { CloseSquare, ImportCurve } from "iconsax-react";
import { downloadImages } from "@/utils/downloadPreviewImg";
import SrcImgForRender from "@/utils/srcImgForRender";

const PreviewImageModal: React.FC<{
  imgURL: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ imgURL, isOpen, setIsOpen }) => {
  const closeModal = () => setIsOpen(false);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <img
              // src={imgURL}
              src={SrcImgForRender(imgURL)}
              alt="Preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
              }}
            />
            <div >
              <Button
                onClick={closeModal}
                isIconOnly
                startContent={<CloseSquare size="56" color="#efff00" />}
                style={{
                  position: "absolute",
                  top: "40px",
                  right: "40px",
                  zIndex: 1001,
                }}
              />
              <Button
                onClick={()=>{downloadImages([imgURL])}}
                isIconOnly
                startContent={<ImportCurve size="28" color="#efff00"/>}
                style={{
                  backgroundColor: "#00000050",
                  position: "absolute",
                  top: "100px",
                  right: "40px",
                  zIndex: 1001,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreviewImageModal;
