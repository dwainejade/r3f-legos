import BrickPicker from "./BrickPicker";
import GridControls from "./GridControls";
import PropertyPanel from "./PropertyPanel";
import { useState } from "react";
import { useShapeStore } from "store/useShapeStore";

const ICONS = [
  { id: "build", label: "Build", icon: "🧱" },
  { id: "select", label: "Select", icon: "🎯" },
  { id: "delete", label: "Delete", icon: "🗑️" },
  { id: "grid", label: "Grid", icon: "⚙️" },
];

const Toolbar = () => {
  const [activePanel, setActivePanel] = useState(null);
  const { shapes, clearAll, getSelectedShape, duplicateShape, setEditorMode } =
    useShapeStore();

  // Wide panel container style (above toolbar, stretches across screen)
  const widePanelContainerStyle = {
    position: "fixed",
    left: "20px",
    right: "20px",
    bottom: "88px", // Above toolbar
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    pointerEvents: "all",
  };

  // Compact panel for property/delete panels
  const compactPanelContainerStyle = {
    position: "fixed",
    left: "50%",
    bottom: "88px",
    transform: "translateX(-50%)",
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "340px",
    maxWidth: "500px",
    pointerEvents: "all",
  };

  // Render the active panel above the toolbar
  const renderPanel = () => {
    if (activePanel === "build") {
      // Build: wide brick picker that stretches across screen
      return (
        <div style={widePanelContainerStyle}>
          <BrickPicker />
        </div>
      );
    }
    if (activePanel === "select") {
      // Select: compact property panel + duplicate button
      const selected = getSelectedShape();
      return (
        <div style={compactPanelContainerStyle}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div style={{ flex: 1 }}>
              <PropertyPanel />
            </div>
            {selected && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minWidth: "120px",
                }}
              >
                <button
                  style={{
                    padding: "12px 16px",
                    background:
                      "linear-gradient(90deg, #00a8cc 0%, #4ecdc4 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: "0 2px 12px #00a8cc44",
                    transition: "all 0.18s cubic-bezier(.4,1.2,.6,1)",
                    textAlign: "center",
                  }}
                  onClick={() => duplicateShape(selected.id)}
                >
                  📋 Duplicate
                </button>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    textAlign: "center",
                    padding: "8px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "6px",
                  }}
                >
                  ID: {selected.id.slice(0, 8)}...
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    if (activePanel === "delete") {
      // Delete: compact delete mode info
      return (
        <div style={compactPanelContainerStyle}>
          <div
            style={{
              background: "rgba(45,45,45,0.97)",
              padding: "16px 24px",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              minWidth: 280,
              textAlign: "center",
              border: "2px solid #dc3545",
              boxShadow: "0 2px 12px #dc354544",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "24px" }}>🗑️</div>
            <div>
              <div style={{ marginBottom: "4px" }}>Delete Mode Enabled</div>
              <div style={{ fontSize: "12px", color: "#ccc" }}>
                Click shapes to delete them
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (activePanel === "grid") {
      // Grid/settings: wide grid controls
      return (
        <div style={widePanelContainerStyle}>
          <div
            style={{
              background: "rgba(45, 45, 45, 0.95)",
              padding: "12px 20px",
              borderRadius: "12px",
              color: "white",
              fontFamily: "Inter, sans-serif",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              width: "100%",
              maxWidth: "800px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#ffffff",
                }}
              >
                ⚙️ Grid Settings
              </div>
            </div>
            <GridControls />
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle icon click: set editor mode and open panel
  const handleIconClick = (id) => {
    if (activePanel === id) {
      setActivePanel(null);
      return;
    }
    if (id === "build") setEditorMode("add");
    if (id === "select") setEditorMode("select");
    if (id === "delete") setEditorMode("remove");
    setActivePanel(id);
  };

  return (
    <>
      {renderPanel()}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "none",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 32,
            background: "none",
            pointerEvents: "all",
          }}
        >
          {ICONS.map((icon) => (
            <button
              key={icon.id}
              onClick={() => handleIconClick(icon.id)}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background:
                  activePanel === icon.id
                    ? "linear-gradient(135deg, #222 60%, #00a8cc 100%)"
                    : "rgba(40,40,40,0.95)",
                border:
                  activePanel === icon.id
                    ? "3px solid #00a8cc"
                    : "3px solid #222",
                boxShadow:
                  activePanel === icon.id
                    ? "0 2px 16px #00a8cc44"
                    : "0 2px 8px #0008",
                color: "#fff",
                fontSize: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 8px",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.18s cubic-bezier(.4,1.2,.6,1)",
                borderBottom:
                  activePanel === icon.id
                    ? "4px solid #4ecdc4"
                    : "4px solid transparent",
                position: "relative",
              }}
              title={icon.label}
            >
              {icon.icon}
              {/* Label below icon */}
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 56,
                  transform: "translateX(-50%)",
                  fontSize: 13,
                  color: activePanel === icon.id ? "#4ecdc4" : "#aaa",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  pointerEvents: "none",
                }}
              >
                {icon.label}
              </span>
            </button>
          ))}
        </div>
        {/* Clear All Button */}
        <button
          onClick={clearAll}
          disabled={shapes.length === 0}
          style={{
            marginLeft: 40,
            padding: "12px 20px",
            background:
              shapes.length === 0
                ? "rgba(108, 117, 125, 0.3)"
                : "linear-gradient(90deg, #dc3545 0%, #ff6b6b 100%)",
            color: shapes.length === 0 ? "#666" : "#fff",
            border: "none",
            borderRadius: 12,
            cursor: shapes.length === 0 ? "not-allowed" : "pointer",
            fontSize: 15,
            fontWeight: 700,
            boxShadow: shapes.length === 0 ? "none" : "0 2px 12px #dc354544",
            transition: "all 0.2s cubic-bezier(.4,1.2,.6,1)",
            outline: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 48,
            alignSelf: "center",
            pointerEvents: "all",
          }}
          title="Clear all shapes"
        >
          🧹 Clear All
        </button>
        {/* Shape Count */}
        <div
          style={{
            marginLeft: 16,
            fontSize: 13,
            color: "#aaa",
            fontWeight: 500,
            minWidth: 80,
            textAlign: "center",
            alignSelf: "center",
            pointerEvents: "all",
          }}
        >
          Shapes: {shapes.length}
        </div>
      </div>
    </>
  );
};

export default Toolbar;
