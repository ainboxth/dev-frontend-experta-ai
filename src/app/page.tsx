"use client";

import Home from "@/components/Home";

export default function TP() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100dvw",
        height: "100dvh",
        backgroundColor: "#ffffff00",
      }}
    >
      {/* <div style={{ width: "40%", height: "40%" }}> */}
      {/* <div style={{ width: "50%", height: "50%" }}> */}
      {/* <div style={{ width: "60%", height: "60%" }}> */}
      {/* <div style={{ width: "70%", height: "70%" }}> */}
      {/* <div style={{ width: "80%", height: "80%" }}> */}
      {/* <div style={{ width: "90%", height: "90%" }}> */}
      <div style={{ width: "100%", height: "90%" }}>
      {/* <div style={{ width: "100%", height: "100%" }}> */}
        <Home />
      </div>
    </div>
  );
}
