import { useShapeStore } from "store/useShapeStore";

const Toolbar = () => {
  const { shapes, clearAll, editorMode } = useShapeStore();

  const getModeColor = () => {
    switch (editorMode) {
      case "add":
        return "#28a745";
      case "select":
        return "#007bff";
      case "remove":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getModeIcon = () => {
    switch (editorMode) {
      case "add":
        return "➕";
      case "select":
        return "👆";
      case "remove":
        return "🗑️";
      default:
        return "🛠️";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(45, 45, 45, 0.95)",
        padding: "16px 24px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🏗️ Geometry Builder
        <span
          style={{
            fontSize: "12px",
            color: getModeColor(),
            background: `${getModeColor()}22`,
            padding: "2px 8px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {getModeIcon()} {editorMode.toUpperCase()}
        </span>
      </div>

      <div style={{ fontSize: "12px", color: "#aaa" }}>
        Shapes: {shapes.length}
      </div>

      <button
        onClick={clearAll}
        disabled={shapes.length === 0}
        style={{
          padding: "8px 16px",
          background:
            shapes.length === 0
              ? "rgba(108, 117, 125, 0.5)"
              : "rgba(220, 53, 69, 0.8)",
          color: shapes.length === 0 ? "#666" : "white",
          border: "none",
          borderRadius: "6px",
          cursor: shapes.length === 0 ? "not-allowed" : "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          transition: "all 0.2s ease",
        }}
      >
        🧹 Clear All
      </button>

      <div style={{ fontSize: "11px", color: "#666", maxWidth: "300px" }}>
        {editorMode === "add" && "Click empty space to add cubes"}
        {editorMode === "select" &&
          "Click shapes to select • Use G/R/S for transform modes"}
        {editorMode === "remove" && "Click shapes to delete them"}
      </div>
    </div>
  );
};

export default Toolbar;
