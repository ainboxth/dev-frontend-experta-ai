"use client";
import React, { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useImangePreviewStore } from "@/store/magicImagePreviewStore";
import resizeImage from "@/utils/resizeImage";

interface UploadProps {
  onUploadComplete?: () => void;
}

const MagicUpload: React.FC<UploadProps> = ({ onUploadComplete }) => {
  const oldFileRef = useRef<File | null>(null);

  const { previewImageV2, setPreviewImageV2, setOriginalFileV2, originalFileV2, setIsOldImageSameNewImageV2, isOldImageSameNewImageV2 } = useImangePreviewStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        let file = acceptedFiles[0];

        if (originalFileV2) {
          oldFileRef.current = originalFileV2;
        }
        try {
          file = await resizeImage(file, 1024, 720);
        } catch (error) {
          console.error("Error resizing image:", error);
          return;
        }

        setOriginalFileV2(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewImageV2([previewUrl]);

        if (onUploadComplete) {
          onUploadComplete();
        }
      }
    },
    [originalFileV2, setOriginalFileV2, setPreviewImageV2, onUploadComplete]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    onDrop,
  });

  return (
    <section>
      <div>
        <h2 style={{ color: "white", fontSize: "15px", marginBottom: "8px" }}>Upload Your Image</h2>
      </div>
      <div
        style={{
          padding: "5px",
          height: "130px",
          width: "100%",
          border: "1px solid #666",
          backgroundColor: "#262829",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ...(previewImageV2 && previewImageV2.length > 0
              ? {
                  backgroundImage: `url(${previewImageV2[0]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}),
          }}
          {...getRootProps({ className: "dropzone" })}
        >
          <input {...getInputProps()} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #666",
                borderRadius: "12px",
                backgroundColor: "#C5C5C5",
                color: "#333",
                fontSize: "0.8rem",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Upload
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MagicUpload;
