import React, { useState, useRef, useEffect } from "react";

interface CustomSliderProps {
  minValue?: number;
  maxValue?: number;
  step?: number;
  defaultValue?: number;
  trackColor?: string;
  fillColor?: string;
  thumbColor?: string;
  thumbSize?: number;
  height?: number;
  onChange?: (value: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  minValue = 1,
  maxValue = 10,
  step = 0.01,
  defaultValue = 3,
  trackColor = "#333",
  fillColor = "#d9ff00",
  thumbColor = "#d9ff00",
  thumbSize = 16,
  height = 4,
  onChange,
}) => {
  const [value, setValue] = useState<number>(defaultValue);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e.nativeEvent);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (isDragging && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newValue = minValue + percentage * (maxValue - minValue);

      const roundedValue = parseFloat(
        (Math.round(newValue / step) * step).toFixed(2)
      );

      setValue((prevValue) => {
        if (prevValue !== roundedValue) {
          return roundedValue;
        }
        return prevValue;
      });
    }
  };

  const handleChange = debounce((value: number) => {
    if (onChange) {
      onChange(value);
    }
  }, 100);

  useEffect(() => {
    handleChange(value);
  }, [value]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove as any);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove as any);
    };
  }, [isDragging]);

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div
      style={{
        userSelect: "none",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "95%",
          marginBottom: "8px",
          textAlign: "right",
          color: "#fff",
        }}
      >
        {value.toFixed(2)}
      </div>

      <div
        style={{
          width: "95%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          ref={sliderRef}
          style={{
            width: "100%",
            position: "relative",
            height: `${height}px`,
            backgroundColor: trackColor,
            borderRadius: "8px",
            cursor: "pointer",
            border: "1px solid #666",
          }}
          onMouseDown={handleMouseDown}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${percentage}%`,
              backgroundColor: fillColor,
              borderRadius: "8px",
              transition: "width 0.0s ease",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${percentage}%`,
              transform: "translate(-50%, -50%)",
              width: `${thumbSize}px`,
              height: `${thumbSize}px`,
              backgroundColor: thumbColor,
              borderRadius: "50%",
              cursor: isDragging ? "grabbing" : "grab",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSlider;

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
