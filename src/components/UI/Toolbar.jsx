
// ...existing code...
import BrickPicker from "./BrickPicker";
import GridControls from "./GridControls";
import PropertyPanel from "./PropertyPanel";
import { useState } from "react";
// ...existing code...
import { useShapeStore } from "store/useShapeStore";


const ICONS = [
  { id: "build", label: "Build", icon: "🧱" },
  { id: "select", label: "Select", icon: "�" },
  { id: "delete", label: "Delete", icon: "�️" },
  { id: "grid", label: "Grid", icon: "⚙️" },
];


const Toolbar = () => {
  const [activePanel, setActivePanel] = useState(null);
  const { shapes, clearAll, getSelectedShape, duplicateShape, setEditorMode } = useShapeStore();

  // Panel container style (above toolbar)
  const panelContainerStyle = {
    position: "fixed",
    left: "50%",
    bottom: "88px", // Should match or slightly exceed toolbar height
    transform: "translateX(-50%)",
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "340px",
    maxWidth: "90vw",
    pointerEvents: "all",
  };

  // Render the active panel above the toolbar
  const renderPanel = () => {
    if (activePanel === "build") {
      // Build: color picker + shape/brick type selector
      return (
        <div style={panelContainerStyle}>
          <BrickPicker />
        </div>
      );
    }
    if (activePanel === "select") {
      // Select: show property panel + duplicate button
      const selected = getSelectedShape();
      return (
        <div style={panelContainerStyle}>
          <PropertyPanel />
          {selected && (
            <button
              style={{
                marginTop: 12,
                padding: "10px 24px",
                background: "linear-gradient(90deg, #00a8cc 0%, #4ecdc4 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 2px 12px #00a8cc44",
                transition: "all 0.18s cubic-bezier(.4,1.2,.6,1)",
              }}
              onClick={() => duplicateShape(selected.id)}
            >
              📋 Duplicate Shape
            </button>
          )}
        </div>
      );
    }
    if (activePanel === "delete") {
      // Delete: enable delete mode, show info
      return (
        <div style={panelContainerStyle}>
          <div style={{
            background: "rgba(45,45,45,0.97)",
            padding: 24,
            borderRadius: 12,
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            minWidth: 280,
            textAlign: "center",
            border: "2px solid #dc3545",
            boxShadow: "0 2px 12px #dc354544",
          }}>
            Delete Mode Enabled<br />
            Click shapes to delete them.
          </div>
        </div>
      );
    }
    if (activePanel === "grid") {
      // Grid/settings: grid controls
      return (
        <div style={panelContainerStyle}>
          <GridControls />
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
      <div style={{
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
      }}>
        <div style={{
          display: "flex",
          gap: 32,
          background: "none",
          pointerEvents: "all",
        }}>
          {ICONS.map((icon) => (
            <button
              key={icon.id}
              onClick={() => handleIconClick(icon.id)}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: activePanel === icon.id
                  ? "linear-gradient(135deg, #222 60%, #00a8cc 100%)"
                  : "rgba(40,40,40,0.95)",
                border: activePanel === icon.id
                  ? "3px solid #00a8cc"
                  : "3px solid #222",
                boxShadow: activePanel === icon.id
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
                borderBottom: activePanel === icon.id ? "4px solid #4ecdc4" : "4px solid transparent",
                position: "relative",
              }}
              title={icon.label}
            >
              {icon.icon}
              {/* Label below icon */}
              <span style={{
                position: "absolute",
                left: "50%",
                top: 56,
                transform: "translateX(-50%)",
                fontSize: 13,
                color: activePanel === icon.id ? "#4ecdc4" : "#aaa",
                fontWeight: 600,
                letterSpacing: 0.5,
                pointerEvents: "none",
              }}>{icon.label}</span>
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
        <div style={{
          marginLeft: 16,
          fontSize: 13,
          color: "#aaa",
          fontWeight: 500,
          minWidth: 80,
          textAlign: "center",
          alignSelf: "center",
          pointerEvents: "all",
        }}>
          Shapes: {shapes.length}
        </div>
      </div>
    </>
  );
};

export default Toolbar;
