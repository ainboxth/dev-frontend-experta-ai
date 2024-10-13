"use client";
import React, { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useImangePreviewStore } from "@/store/imagePreviewStore";
import resizeImage from "@/utils/resizeImage";

interface UploadProps {
  onUploadComplete?: () => void;
}

const Upload: React.FC<UploadProps> = ({ onUploadComplete }) => {
  const oldFileRef = useRef<File | null>(null);

  const { previewImage, setPreviewImage, setOriginalFile, originalFile, setIsOldImageSameNewImage, isOldImageSameNewImage } = useImangePreviewStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        let file = acceptedFiles[0];

        if (originalFile) {
          oldFileRef.current = originalFile;
        }
        try {
          file = await resizeImage(file, 1024, 720);
        } catch (error) {
          console.error("Error resizing image:", error);
          return;
        }

        setOriginalFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage([previewUrl]);

        if (onUploadComplete) {
          onUploadComplete();
        }
      }
    },
    [originalFile, setOriginalFile, setPreviewImage, onUploadComplete]
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
            ...(previewImage && previewImage.length > 0
              ? {
                  backgroundImage: `url(${previewImage[0]})`,
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

export default Upload;
