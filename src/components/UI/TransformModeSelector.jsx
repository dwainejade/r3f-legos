import { useEffect } from "react";
import { useShapeStore } from "store/useShapeStore";

const TransformModeSelector = () => {
  const { transformMode, setTransformMode, editorMode, selectedShapeId } =
    useShapeStore();

  const modes = [
    { id: "translate", label: "Move", icon: "↔️", key: "G" },
    { id: "rotate", label: "Rotate", icon: "🔄", key: "R" },
    { id: "scale", label: "Scale", icon: "📏", key: "S" },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.target.tagName === "INPUT") return;
      if (editorMode !== "select" || !selectedShapeId) return;

      switch (event.key.toLowerCase()) {
        case "g":
          setTransformMode("translate");
          break;
        case "r":
          setTransformMode("rotate");
          break;
        case "s":
          setTransformMode("scale");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [setTransformMode, editorMode, selectedShapeId]);

  // Only show in select mode when something is selected
  if (editorMode !== "select" || !selectedShapeId) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "340px", // Position next to editor mode selector
        background: "rgba(45, 45, 45, 0.95)",
        padding: "12px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        gap: "8px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#ccc",
          padding: "8px 8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        Transform:
      </div>

      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setTransformMode(mode.id)}
          style={{
            padding: "8px 12px",
            background:
              transformMode === mode.id
                ? "rgba(0, 168, 204, 0.8)"
                : "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            border:
              transformMode === mode.id
                ? "2px solid #00a8cc"
                : "2px solid transparent",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s ease",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          }}
          title={`${mode.label} (${mode.key})`}
        >
          <span style={{ fontSize: "12px" }}>{mode.icon}</span>
          <span>{mode.label}</span>
          <span style={{ fontSize: "8px", opacity: 0.7 }}>({mode.key})</span>
        </button>
      ))}
    </div>
  );
};

export default TransformModeSelector;
