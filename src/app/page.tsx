"use client";

import Home from "@/components/Home";

export default function TP() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        width: "100dvw",
        height: "100dvh",
        maxHeight: "100vh",
        // backgroundColor: "#ffffff00",
      }}
    >
      <div style={{ width: "100%", height: "55px", backgroundColor: "#181A1B" }}>
        <img src="/default/logo.webp" alt="logo" style={{height: "100%", marginLeft: "8px"}}/>
      </div>
      <div style={{ width: "100%", height: "90%" }}>
        <Home />
      </div>
    </div>
  );
}
