import React, { useState, useEffect, useRef, useCallback } from "react";
import tinycolor from "tinycolor2";

interface ColorPickerProps {
  onColorSelect: (hexCode: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorSelect }) => {
  const [currentColor, setCurrentColor] = useState("");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [lightness, setLightness] = useState(0.5);
  const [hexValue, setHexValue] = useState("");

  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);
  const spectrumCursorRef = useRef<HTMLDivElement>(null);
  const hueCursorRef = useRef<HTMLDivElement>(null);

  const createShadeSpectrum = useCallback((color = "#f00") => {
    const canvas = spectrumRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    whiteGradient.addColorStop(0, "#fff");
    whiteGradient.addColorStop(1, "transparent");
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    blackGradient.addColorStop(0, "transparent");
    blackGradient.addColorStop(1, "#000");
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const createHueSpectrum = useCallback(() => {
    const canvas = hueRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    hueGradient.addColorStop(0.0, "hsl(0, 100%, 50%)");
    hueGradient.addColorStop(0.17, "hsl(298.8, 100%, 50%)");
    hueGradient.addColorStop(0.33, "hsl(241.2, 100%, 50%)");
    hueGradient.addColorStop(0.5, "hsl(180, 100%, 50%)");
    hueGradient.addColorStop(0.67, "hsl(118.8, 100%, 50%)");
    hueGradient.addColorStop(0.83, "hsl(61.2, 100%, 50%)");
    hueGradient.addColorStop(1.0, "hsl(360, 100%, 50%)");
    ctx.fillStyle = hueGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    createShadeSpectrum();
    createHueSpectrum();
  }, [createShadeSpectrum, createHueSpectrum]);

  const colorToHue = (color: string) => {
    const hsl = tinycolor(color).toHsl();
    return tinycolor(`hsl ${hsl.h} 1 .5`).toHslString();
  };

  const colorToPos = (color: string) => {
    const tColor = tinycolor(color);
    const hsl = tColor.toHsl();
    const hsv = tColor.toHsv();
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);

    if (!spectrumRef.current || !hueRef.current) return;

    const x = spectrumRef.current.width * hsv.s;
    const y = spectrumRef.current.height * (1 - hsv.v);
    const hueY = hueRef.current.height - (hsl.h / 360) * hueRef.current.height;

    updateSpectrumCursor(x, y);
    updateHueCursor(hueY);
    setCurrentColor(tColor.toHexString());
    createShadeSpectrum(colorToHue(color));
  };

  const setColorValues = (color: string) => {
    const tColor = tinycolor(color);
    setHexValue(tColor.toHex());
  };

  const updateHueCursor = (y: number) => {
    if (hueCursorRef.current) {
      hueCursorRef.current.style.top = `${y}px`;
    }
  };

  const updateSpectrumCursor = (x: number, y: number) => {
    if (spectrumCursorRef.current) {
      spectrumCursorRef.current.style.left = `${x}px`;
      spectrumCursorRef.current.style.top = `${y}px`;
    }
  };

  const handleSpectrumMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const handleSpectrumMouseMove = (e: MouseEvent) => {
      getSpectrumColor(e);
    };

    const handleSpectrumMouseUp = () => {
      document.removeEventListener("mousemove", handleSpectrumMouseMove);
      document.removeEventListener("mouseup", handleSpectrumMouseUp);
    };

    getSpectrumColor(e);
    document.addEventListener("mousemove", handleSpectrumMouseMove);
    document.addEventListener("mouseup", handleSpectrumMouseUp);
  };

  const getSpectrumColor = (e: MouseEvent | React.MouseEvent) => {
    if (!spectrumRef.current) return;

    const { left, top, width, height } = spectrumRef.current.getBoundingClientRect();
    let x = (e as MouseEvent).clientX - left;
    let y = (e as MouseEvent).clientY - top;

    x = Math.max(0, Math.min(x, width));
    y = Math.max(0, Math.min(y, height));

    const xRatio = x / width;
    const yRatio = y / height;
    const hsvValue = 1 - yRatio;
    const hsvSaturation = xRatio;
    const lightness = (hsvValue / 2) * (2 - hsvSaturation);
    const saturation = (hsvValue * hsvSaturation) / (1 - Math.abs(2 * lightness - 1));
    const color = tinycolor(`hsl ${hue} ${saturation} ${lightness}`);

    setCurrentColor(color.toHexString());
    setSaturation(saturation);
    setLightness(lightness);
    setColorValues(color.toHexString());
    updateSpectrumCursor(x, y);
  };

  const handleHueMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const handleHueMouseMove = (e: MouseEvent) => {
      getHueColor(e);
    };

    const handleHueMouseUp = () => {
      document.removeEventListener("mousemove", handleHueMouseMove);
      document.removeEventListener("mouseup", handleHueMouseUp);
    };

    getHueColor(e);
    document.addEventListener("mousemove", handleHueMouseMove);
    document.addEventListener("mouseup", handleHueMouseUp);
  };

  const getHueColor = (e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;

    const { top, height } = hueRef.current.getBoundingClientRect();
    let y = (e as MouseEvent).clientY - top;
    y = Math.max(0, Math.min(y, height));

    const percent = y / height;
    const newHue = 360 - 360 * percent;
    const hueColor = tinycolor(`hsl ${newHue} 1 .5`).toHslString();
    const color = tinycolor(`hsl ${newHue} ${saturation} ${lightness}`).toHslString();

    createShadeSpectrum(hueColor);
    updateHueCursor(y);
    setCurrentColor(color);
    setHue(newHue);
    setColorValues(color);
  };

  const handleGetColor = () => {
    onColorSelect(currentColor);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = tinycolor(e.target.value);
    if (newColor.isValid()) {
      setHexValue(e.target.value);
      colorToPos(newColor.toHexString());
    }
  };

  return (
    <div style={{ background: "#2a2a2a", width: "250px", borderRadius: "10px", padding: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)", fontFamily: "Arial, sans-serif", color: "#fff" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ position: "relative", width: "200px", height: "200px" }}>
          <div ref={spectrumCursorRef} style={{ position: "absolute", width: "10px", height: "10px", border: "2px solid white", borderRadius: "50%", pointerEvents: "none", transform: "translate(-50%, -50%)" }} />
          <canvas ref={spectrumRef} width="200" height="200" style={{ borderRadius: "4px" }} onMouseDown={handleSpectrumMouseDown} />
        </div>
        <div style={{ position: "relative", width: "20px", height: "200px" }}>
          <div ref={hueCursorRef} style={{ position: "absolute", width: "10px", height: "10px", border: "2px solid white", borderRadius: "50%", pointerEvents: "none", left: "50%", transform: "translateX(-50%)" }} />
          <canvas ref={hueRef} width="20" height="200" style={{ borderRadius: "4px" }} onMouseDown={handleHueMouseDown} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
        <label>Hex:</label>
        <input type="text" style={{ width: "100%", background: "#3a3a3a", border: "1px solid #4a4a4a", color: "#fff", padding: "5px 10px", borderRadius: "4px" }} value={hexValue} onChange={handleHexChange} maxLength={7} />
      </div>
      <button style={{ width: "100%", background: "#3a3a3a", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }} onClick={handleGetColor}>
        Get Color
      </button>
    </div>
  );
};

export default ColorPicker;
