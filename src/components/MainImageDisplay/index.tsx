"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useImangeResponseStore } from "@/store/imageResponseStore";
import { useImangePreviewStore } from "@/store/imagePreviewStoer";
import { useLoadingState } from "@/store/loadingState";
import LoadingWaitingImage from "../Loading/LoadingWaitingImage";
import SrcImgForRender from "@/utils/srcImgForRender";
import { defaultIMGBase64 } from "../../../public/default/defaultIMG";
import { useGenerateClickStore } from "@/store/generateClickState";
import { useSelectionPathsStore } from "@/store/selectionPathStore";

interface MainImageDisplayProps {
  selectedTool: "freehand" | "rubber" | "rectangle" | "point2point";
}

const MainImageDisplay: React.FC<MainImageDisplayProps> = ({ selectedTool }) => {
  const defaultImage = defaultIMGBase64;
  const { responseImage } = useImangeResponseStore();
  const { previewImage } = useImangePreviewStore();
  const { isLoadingWaitingResponse } = useLoadingState();
  const { generateClickState } = useGenerateClickStore();
  const { paths, setPaths } = useSelectionPathsStore();
  const [imagePaths, setImagePaths] = useState<string[]>([defaultImage]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[][]>([]);
  const [isClosingPath, setIsClosingPath] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedTool === "point2point") {
        e.preventDefault();
        setCurrentPath([]);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx && offscreenCanvasRef.current) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(offscreenCanvasRef.current, 0, 0);
          }
        }
      }
    },
    [selectedTool]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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

          // Create offscreen canvas
          offscreenCanvasRef.current = document.createElement("canvas");
          offscreenCanvasRef.current.width = img.width;
          offscreenCanvasRef.current.height = img.height;
          const offscreenCtx = offscreenCanvasRef.current.getContext("2d");

          if (offscreenCtx) {
            offscreenCtx.drawImage(img, 0, 0);
            redrawPaths(offscreenCtx);
            ctx.drawImage(offscreenCanvasRef.current, 0, 0);
          }
        };
        img.src = imagePaths[0];
      }
    }
  }, [imagePaths, paths]);

  const redrawPaths = (ctx: CanvasRenderingContext2D) => {
    paths.forEach((path) => {
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      if (path.type === "freehand" && path.points.length > 0) {
        ctx.moveTo(path.points[0][0], path.points[0][1]);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i][0], path.points[i][1]);
        }
      } else if (path.type === "rectangle" && path.points.length === 2) {
        const [start, end] = path.points;
        ctx.rect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
      } else if (path.type === "point2point" && path.points.length > 0) {
        ctx.moveTo(path.points[0][0], path.points[0][1]);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i][0], path.points[i][1]);
        }
        if (path.points.length > 2) {
          ctx.closePath();
        }
      }
      ctx.stroke();
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
    const canvas = canvasRef.current;
    if (canvas) {
      const { x, y } = getMousePos(canvas, e);
      if (selectedTool === "point2point") {
        if (currentPath.length === 0 || isClosingPath) {
          setCurrentPath([[x, y]]);
          setIsClosingPath(false);
        } else {
          setCurrentPath([...currentPath, [x, y]]);
        }
      } else {
        setIsDrawing(true);
        setCurrentPath([[x, y]]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && selectedTool !== "point2point") return;
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (canvas && offscreenCanvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { x, y } = getMousePos(canvas, e);

        if (selectedTool === "freehand") {
          setCurrentPath((prev) => [...prev, [x, y]]);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (currentPath.length > 0) {
            ctx.beginPath();
            ctx.moveTo(currentPath[currentPath.length - 1][0], currentPath[currentPath.length - 1][1]);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(offscreenCanvas, 0, 0);

          ctx.beginPath();
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;

          if (selectedTool === "rectangle" && currentPath.length === 1) {
            const [startX, startY] = currentPath[0];
            ctx.rect(startX, startY, x - startX, y - startY);
            ctx.stroke();
          } else if (selectedTool === "point2point" && currentPath.length > 0) {
            ctx.moveTo(currentPath[0][0], currentPath[0][1]);
            for (let i = 1; i < currentPath.length; i++) {
              ctx.lineTo(currentPath[i][0], currentPath[i][1]);
            }
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { x, y } = getMousePos(canvas, e);

      if (selectedTool === "point2point") {
        if (currentPath.length > 2 && Math.abs(currentPath[0][0] - currentPath[currentPath.length - 1][0]) < 5 && Math.abs(currentPath[0][1] - currentPath[currentPath.length - 1][1]) < 5) {
          setIsClosingPath(true);
          setPaths([...paths, { type: "point2point", points: [...currentPath, currentPath[0]] }]);
          setCurrentPath([]);
        }
      } else if (selectedTool === "rectangle") {
        setIsDrawing(false);
        if (currentPath.length === 1) {
          const updatedPath = [...currentPath, [x, y]];
          setPaths([...paths, { type: "rectangle", points: updatedPath }]);
          setCurrentPath([]);
        }
      } else {
        // For freehand and other tools
        setIsDrawing(false);
        if (currentPath.length > 1) {
          setPaths([...paths, { type: selectedTool, points: currentPath }]);
          setCurrentPath([]);
        }
      }

      // Update offscreen canvas
      const offscreenCanvas = offscreenCanvasRef.current;
      if (offscreenCanvas) {
        const ctx = canvas.getContext("2d");
        const offscreenCtx = offscreenCanvas.getContext("2d");
        if (ctx && offscreenCtx) {
          offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);
          offscreenCtx.drawImage(canvas, 0, 0);
        }
      }
    }
  };

  if (offscreenCanvasRef.current) {
    const offscreenCtx = offscreenCanvasRef.current.getContext("2d");
    if (offscreenCtx) {
      redrawPaths(offscreenCtx);
    }
  }

  if (isLoadingWaitingResponse) {
    return <LoadingWaitingImage />;
  }

  return (
    <div style={{ flex: 1, border: "2px solid #ffffff10", height: "100%", marginRight: "24px", borderRadius: "8px", overflow: "hidden" }}>
      {generateClickState ? (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={selectedTool === "point2point" ? handleMouseDown : undefined}
          style={{ width: "100%", height: "100%", cursor: "crosshair" }}
          tabIndex={0} // This makes the canvas focusable
        />
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
