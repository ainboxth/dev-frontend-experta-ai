"use client";
import { useState } from "react";

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ตรวจสอบว่ามีการกรอกข้อมูลครบถ้วน
      if (!password) {
        setError("กรุณากรอกรหัสผ่าน");
        return;
      }

      // ส่งรหัสผ่านไปยังเซิร์ฟเวอร์เพื่อตรวจสอบ
      const response = await fetch("/api/v1/setting/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("รหัสผ่านไม่ถูกต้อง");
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "การเข้าสู่ระบบล้มเหลว");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          color: "#efff00",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Environment Variables Editor
      </h1>
      <div
        style={{
          backgroundColor: "#1e1e1e",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h2
          style={{
            color: "#efff00",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          กรุณาเข้าสู่ระบบ
        </h2>

        {error && (
          <p
            style={{
              color: "#ff5555",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่าน"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#2d2d2d",
              color: "white",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isLoading ? "#aaaa00" : "#efff00",
            color: "black",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
        </button>
      </div>
    </div>
  );
};
