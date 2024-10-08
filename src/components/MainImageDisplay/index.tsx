"use client";
import React, { useState, useEffect, useRef } from "react";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useImangePreviewStore } from "@/store/imagePreviewStoer";
import { useLoadingState } from "@/store/loadingState";
import LoadingWaitingImage from "../Loading/LoadingWaitingImage";
import SrcImgForRender from "@/utils/srcImgForRender";
import { defaultIMGBase64 } from "../../../public/default/defaultIMG";
import { useGenerateClickStore } from "@/store/generateClickState";

interface MainImageDisplayProps {
  selectedTool: "freehand" | "rectangle";
}

const MainImageDisplay: React.FC<MainImageDisplayProps> = ({ selectedTool }) => {
  const defaultImage = defaultIMGBase64;
  const { responseImage } = useImangeResponseStore();
  const { previewImage } = useImangePreviewStore();
  const { isLoadingWaitingResponse } = useLoadingState();
  const { generateClickState } = useGenerateClickStore();
  const [imagePaths, setImagePaths] = useState<string[]>([defaultImage]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[][]>([]);
  const [allPaths, setAllPaths] = useState<Array<{ type: "freehand" | "rectangle"; points: number[][] }>>([]);

  useEffect(() => {
    if (responseImage && responseImage.length > 0) {
      setImagePaths(responseImage);
    } else if (previewImage && previewImage.length > 0) {
      setImagePaths(previewImage);
    } else {
      setImagePaths([defaultImage]);
    }
  }, [responseImage, previewImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && imagePaths[0] !== defaultImage) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          redrawPaths(ctx);
        };
        img.src = imagePaths[0];
      }
    }
  }, [imagePaths]);

  const redrawPaths = (ctx: CanvasRenderingContext2D) => {
    allPaths.forEach((path) => {
      ctx.beginPath();
      ctx.fillStyle = "red";
      if (path.type === "freehand" && path.points.length > 0) {
        ctx.moveTo(path.points[0][0], path.points[0][1]);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i][0], path.points[i][1]);
        }
        ctx.closePath();
      } else if (path.type === "rectangle" && path.points.length === 2) {
        const [start, end] = path.points;
        ctx.rect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
      }
      ctx.fill();
    });
  };

  const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const { x, y } = getMousePos(canvas, e);
      setCurrentPath([[x, y]]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { x, y } = getMousePos(canvas, e);

        if (selectedTool === "freehand") {
          setCurrentPath((prev) => [...prev, [x, y]]);
          ctx.beginPath();
          ctx.moveTo(currentPath[currentPath.length - 1][0], currentPath[currentPath.length - 1][1]);
          ctx.lineTo(x, y);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (selectedTool === "rectangle") {
          const startX = currentPath[0][0];
          const startY = currentPath[0][1];
          const width = x - startX;
          const height = y - startY;

          // Clear only the area of the previous rectangle
          if (currentPath.length > 1) {
            const prevX = currentPath[1][0];
            const prevY = currentPath[1][1];
            const prevWidth = prevX - startX;
            const prevHeight = prevY - startY;
            ctx.clearRect(Math.min(startX, prevX) - 2, Math.min(startY, prevY) - 2, Math.abs(prevWidth) + 4, Math.abs(prevHeight) + 4);
          }

          // Draw the new rectangle
          ctx.beginPath();
          ctx.rect(startX, startY, width, height);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Update the current path with the new end point
          setCurrentPath([currentPath[0], [x, y]]);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (currentPath.length > 1) {
      if (selectedTool === "freehand") {
        setAllPaths((prev) => [...prev, { type: "freehand", points: currentPath }]);
      } else if (selectedTool === "rectangle") {
        setAllPaths((prev) => [...prev, { type: "rectangle", points: currentPath }]);
      }
    }
    setCurrentPath([]);
  };

  if (isLoadingWaitingResponse) {
    return <LoadingWaitingImage />;
  }

  return (
    <div style={{ flex: 1, border: "2px solid #ffffff10", height: "100%", marginRight: "24px", borderRadius: "8px", overflow: "hidden" }}>
      {generateClickState ? (
        <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{ width: "100%", height: "100%", cursor: "crosshair" }} />
      ) : (
        imagePaths.map((path, index) => (
          <img
            key={index}
            src={SrcImgForRender(path)}
            alt={`Image ${index + 1}`}
            style={{
              width: imagePaths.length === 1 ? "100%" : "calc(50% - 5px)",
              height: imagePaths.length === 1 ? "100%" : "calc(50% - 5px)",
              objectFit: "contain",
              borderRadius: "8px",
              marginBottom: index < 2 ? "0" : "10px",
            }}
          />
        ))
      )}
    </div>
  );
};

export default MainImageDisplay;
