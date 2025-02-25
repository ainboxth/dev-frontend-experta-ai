// app/env-editor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { LoginScreen } from "./LoginScreen";

interface EnvVariable {
  key: string;
  value: string;
}

export default function EnvEditor() {
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication on page load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
        fetchEnvVariables();
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Handle login with a 1-second loading delay
  const handleLogin = () => {
    setIsLoading(true); // Show loading modal
    setTimeout(() => {
      setIsAuthenticated(true); // Update authentication state after 1 second
      fetchEnvVariables();
      setIsLoading(false); // Hide loading modal
    }, 500);
  };

  // Fetch environment variables from the API
  const fetchEnvVariables = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/setting");
      if (!response.ok) {
        throw new Error("Failed to fetch environment variables");
      }
      const data = await response.json();
      const envArray: EnvVariable[] = Object.entries(data).map(
        ([key, value]) => ({
          key,
          value: value as string,
        })
      );
      setEnvVariables(envArray);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save environment variables to the API
  const saveEnvVariables = async () => {
    try {
      setIsLoading(true);
      const envObject = envVariables.reduce(
        (acc, { key, value }) => {
          if (key.trim()) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );
      const response = await fetch("/api/v1/setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(envObject),
      });
      if (!response.ok) {
        throw new Error("Failed to save environment variables");
      }
      setSuccess("บันทึกการตั้งค่าเรียบร้อยแล้ว!");
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new environment variable
  const addEnvVariable = () => {
    setEnvVariables([...envVariables, { key: "", value: "" }]);
  };

  // Remove an environment variable
  const removeEnvVariable = (index: number) => {
    const newEnvVariables = [...envVariables];
    newEnvVariables.splice(index, 1);
    setEnvVariables(newEnvVariables);
  };

  // Update an environment variable
  const updateEnvVariable = (
    index: number,
    field: "key" | "value",
    newValue: string
  ) => {
    const newEnvVariables = [...envVariables];
    newEnvVariables[index][field] = newValue;
    setEnvVariables(newEnvVariables);
  };

  // Handle logout with a 1-second loading delay
  const handleLogout = () => {
    setIsLoading(true); // Show loading modal
    setTimeout(() => {
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setIsLoading(false); // Hide loading modal
    }, 500);
  };

  // Styles for the component
  const styles = {
    container: {
      backgroundColor: "#121212",
      color: "white",
      padding: "20px",
      minHeight: "100vh",
    },
    title: {
      color: "#efff00",
      marginBottom: "20px",
      textAlign: "center" as const,
    },
    error: {
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      color: "#ff5555",
      padding: "10px",
      borderRadius: "4px",
      marginBottom: "15px",
    },
    success: {
      backgroundColor: "rgba(0, 255, 0, 0.1)",
      color: "#55ff55",
      padding: "10px",
      borderRadius: "4px",
      marginBottom: "15px",
    },
    envList: {
      backgroundColor: "#1e1e1e",
      borderRadius: "8px",
      overflow: "hidden",
      marginBottom: "20px",
    },
    header: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr auto",
      padding: "10px",
      backgroundColor: "#2d2d2d",
      fontWeight: "bold",
    },
    keyColumn: {
      padding: "0 10px",
    },
    valueColumn: {
      padding: "0 10px",
    },
    actionColumn: {
      padding: "0 10px",
      textAlign: "center" as const,
    },
    envRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr auto",
      padding: "10px",
      borderBottom: "1px solid #333",
    },
    keyInput: {
      width: "90%",
      padding: "8px",
      backgroundColor: "#2d2d2d",
      color: "white",
      border: "1px solid #444",
      borderRadius: "4px",
    },
    valueInput: {
      width: "90%",
      padding: "8px",
      backgroundColor: "#2d2d2d",
      color: "white",
      border: "1px solid #444",
      borderRadius: "4px",
    },
    removeButton: {
      padding: "8px 12px",
      backgroundColor: "#ff5555",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    actions: {
      display: "flex",
      justifyContent: "start",
      marginTop: "40px",
      gap: "10px",
    },
    addButton: {
      padding: "10px 15px",
      backgroundColor: "#333",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    saveButton: {
      padding: "10px 15px",
      backgroundColor: "#efff00",
      color: "black",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    refreshButton: {
      padding: "10px 15px",
      backgroundColor: "#444",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    logoutButton: {
      padding: "10px 15px",
      backgroundColor: "#555",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginLeft: "auto",
    },
    // Modal styles
    modalOverlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "#1e1e1e",
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center" as const,
    },
    loadingText: {
      color: "white",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Loading Modal */}
      {isLoading && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div className="spinner"></div>{" "}
            {/* Add your loading animation here */}
            <p style={styles.loadingText}>กำลังโหลด...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1 style={styles.title}>Environment Variables Editor</h1>
            <button onClick={handleLogout} style={styles.logoutButton}>
              ออกจากระบบ
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <div style={styles.envList}>
            <div style={styles.header}>
              <div style={styles.keyColumn}>Key</div>
              <div style={styles.valueColumn}>Value</div>
              <div style={styles.actionColumn}>Action</div>
            </div>

            {envVariables.map((variable, index) => (
              <div key={index} style={styles.envRow}>
                <input
                  type="text"
                  value={variable.key}
                  onChange={(e) =>
                    updateEnvVariable(index, "key", e.target.value)
                  }
                  placeholder="KEY"
                  style={styles.keyInput}
                />
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e) =>
                    updateEnvVariable(index, "value", e.target.value)
                  }
                  placeholder="VALUE"
                  style={styles.valueInput}
                />
                <button
                  onClick={() => removeEnvVariable(index)}
                  style={styles.removeButton}
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button onClick={fetchEnvVariables} style={styles.refreshButton}>
              รีเฟรช
            </button>
            <button onClick={addEnvVariable} style={styles.addButton}>
              เพิ่มตัวแปร
            </button>
            <button onClick={saveEnvVariables} style={styles.saveButton}>
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </>
      )}
    </div>
  );
}
