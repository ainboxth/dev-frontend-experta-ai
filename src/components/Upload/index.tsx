"use client";
import React, { useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useImangePreviewStore } from "@/store/imagePreviewStoer";
import resizeImage from "@/utils/resizeImage";

const Upload: React.FC = () => {
  const oldFileRef = useRef<File | null>(null);

  const {
    previewImage,
    setPreviewImage,
    setOriginalFile,
    originalFile,
    setIsOldImageSameNewImage,
    isOldImageSameNewImage,
  } = useImangePreviewStore();

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
      }
    },
    [originalFile, setOriginalFile, setPreviewImage]
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
      <div
        style={{
          padding: "10% 0",
          width: "100%",
          border: "1px solid #666",
          backgroundColor: "#262829",
          borderRadius: "18px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          ...(previewImage
            ? {
                backgroundImage: `url(${previewImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
        {...getRootProps({ className: "dropzone" })}
      >
        <input {...getInputProps()} />
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
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
          <span style={{ fontSize: "0.8rem", color: "#fff" }}>
            JPG and PNG files
          </span>
        </div>
      </div>
    </section>
  );
};

export default Upload;
