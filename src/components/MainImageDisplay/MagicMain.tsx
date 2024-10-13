"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useImangeResponseStore } from "@/store/magicImageResponseStore";
import { useImangePreviewStore } from "@/store/magicImagePreviewStore";
import { useLoadingState } from "@/store/loadingState";
import LoadingWaitingImage from "../Loading/LoadingWaitingImage";
import SrcImgForRender from "@/utils/srcImgForRender";
import { defaultIMGBase64 } from "../../../public/default/defaultIMG";
import { useSelectionPathsStore, SelectionPath } from "@/store/selectionPathStore";
import { useMagicGeneratedStore } from "@/store/magicGeneratedState";
import { useMagicUploadedStore } from "@/store/magicUploadedState";

interface MainImageDisplayProps {
  selectedTool: "freehand" | "rubber" | "rectangle" | "point2point";
}

const MagicMainImageDisplay: React.FC<MainImageDisplayProps> = ({ selectedTool }) => {
  const defaultImage = defaultIMGBase64;
  const { responseImageV2 } = useImangeResponseStore();
  const { previewImageV2, resetMagicUploadState } = useImangePreviewStore();
  const { isLoadingWaitingResponse } = useLoadingState();
  const [imagePaths, setImagePaths] = useState<string[]>([defaultImage]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { paths, addPath, removePath, clearPaths } = useSelectionPathsStore();
  const [currentPath, setCurrentPath] = useState<number[][]>([]);
  const [isClosingPath, setIsClosingPath] = useState(false);
  const { magicGeneratedState, setMagicGeneratedState } = useMagicGeneratedStore();
  const { magicUploadedState, setMagicUploadedState } = useMagicUploadedStore();

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
    if (responseImageV2 && responseImageV2.length > 0) {
      setImagePaths(responseImageV2);
      setMagicGeneratedState(true);
      clearPaths(); // Clear existing paths when a new image is generated
    } else if (previewImageV2 && previewImageV2.length > 0) {
      setImagePaths(previewImageV2);
      setMagicUploadedState(true);
    } else {
      setImagePaths([defaultImage]);
      setMagicGeneratedState(false);
      setMagicUploadedState(false);
    }
  }, [responseImageV2, previewImageV2, setMagicGeneratedState, setMagicUploadedState, clearPaths]);

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
        img.src = SrcImgForRender(imagePaths[0]);
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
      if (selectedTool === "rubber") {
        const clickedPath = paths.find((path) => isPointInPath(path, x, y));
        if (clickedPath) {
          removePath(clickedPath.id);
        }
      } else if (selectedTool === "point2point") {
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

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreenCanvas, 0, 0);

        if (selectedTool === "freehand") {
          setCurrentPath((prev) => [...prev, [x, y]]);
          drawPath(ctx, currentPath);
        } else if (selectedTool === "rectangle" && currentPath.length === 1) {
          drawRectangle(ctx, currentPath[0], [x, y]);
        } else if (selectedTool === "point2point" && currentPath.length > 0) {
          drawPath(ctx, [...currentPath, [x, y]]);
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== "rubber") {
      const canvas = canvasRef.current;
      if (canvas) {
        const { x, y } = getMousePos(canvas, e);

        if (selectedTool === "point2point") {
          if (currentPath.length > 2 && isCloseToStartPoint(currentPath[0], [x, y])) {
            setIsClosingPath(true);
            addPath({ id: uuidv4(), type: "point2point", points: [...currentPath, currentPath[0]] });
            setCurrentPath([]);
          }
        } else if (selectedTool === "rectangle") {
          setIsDrawing(false);
          if (currentPath.length === 1) {
            addPath({ id: uuidv4(), type: "rectangle", points: [...currentPath, [x, y]] });
            setCurrentPath([]);
          }
        } else if (selectedTool === "freehand") {
          setIsDrawing(false);
          if (currentPath.length > 1) {
            addPath({ id: uuidv4(), type: "freehand", points: currentPath });
            setCurrentPath([]);
          }
        }

        updateOffscreenCanvas();
      }
    }
  };

  const isPointInPath = (path: SelectionPath, x: number, y: number): boolean => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      if (path.type === "freehand" || path.type === "point2point") {
        ctx.moveTo(path.points[0][0], path.points[0][1]);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i][0], path.points[i][1]);
        }
        ctx.closePath();
      } else if (path.type === "rectangle" && path.points.length === 2) {
        const [start, end] = path.points;
        ctx.rect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
      }
      return ctx.isPointInPath(x, y);
    }
    return false;
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: number[][]) => {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, start: number[], end: number[]) => {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.rect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
    ctx.stroke();
  };

  const isCloseToStartPoint = (start: number[], current: number[], threshold = 5) => {
    return Math.abs(start[0] - current[0]) < threshold && Math.abs(start[1] - current[1]) < threshold;
  };

  const updateOffscreenCanvas = () => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (canvas && offscreenCanvas) {
      const ctx = canvas.getContext("2d");
      const offscreenCtx = offscreenCanvas.getContext("2d");
      if (ctx && offscreenCtx) {
        offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);
        offscreenCtx.drawImage(canvas, 0, 0);
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
    <div style={{ flex: 1, height: "100%", marginRight: "24px", borderRadius: "8px", overflow: "hidden" }}>
      {!magicUploadedState && !magicGeneratedState ? (
        <img
          src={SrcImgForRender(imagePaths[0])}
          alt="Single Image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={selectedTool === "point2point" ? handleMouseDown : undefined}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              cursor: "crosshair",
            }}
            tabIndex={0}
          />
        </div>
      )}
    </div>
  );
};

export default MagicMainImageDisplay;

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
