"use client";
import React, { useState, useEffect, memo } from "react";
import { Skeleton, Progress } from "@nextui-org/react";

const WaitingDisplay = memo(() => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      {[...Array(2)].map((_, index) => (
        <Skeleton
          key={`top-${index}`}
          style={{
            borderRadius: "0.5rem",
            background: "var(--nextui-colors-background)",
            border: "1px solid #ffffff20",
          }}
        >
          <div
            style={{
              width: "26rem",
              height: "16rem",
              background: "var(--nextui-colors-background)",
            }}
          ></div>
        </Skeleton>
      ))}
    </div>
  );
});

const LoadingWaitingImage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 98 ? 98 : prevProgress + 1
      );
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <WaitingDisplay />
      <WaitingDisplay />

      <Progress
        aria-label="Downloading..."
        size="md"
        value={progress}
        color="warning"
        showValueLabel={false}
        className="max-w-md"
      />
    </div>
  );
};

export default LoadingWaitingImage;
