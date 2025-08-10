import { useShapeStore } from "store/useShapeStore";

const GridControls = () => {
  const {
    gridSize,
    gridSubdivisions,
    snapToGrid,
    gridVisible,
    setGridSize,
    setGridSubdivisions,
    toggleSnapToGrid,
    toggleGridVisible,
    getSnapSize,
  } = useShapeStore();

  const snapSize = getSnapSize();

  const subdivisionPresets = [
    { label: "1 (Coarse)", value: 1, description: "1 unit grid" },
    { label: "2 (Half)", value: 2, description: "0.5 unit grid" },
    { label: "4 (Quarter)", value: 4, description: "0.25 unit grid" },
    { label: "5 (Fifth)", value: 5, description: "0.2 unit grid" },
    { label: "10 (Fine)", value: 10, description: "0.1 unit grid" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        background: "rgba(45, 45, 45, 0.95)",
        padding: "16px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        minWidth: "280px",
        maxWidth: "320px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "16px",
          color: "#4ecdc4",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        📐 Grid & Snapping
      </div>

      {/* Current Snap Info */}
      <div
        style={{
          padding: "8px 12px",
          background: "rgba(78, 205, 196, 0.1)",
          borderRadius: "8px",
          marginBottom: "16px",
          border: "1px solid rgba(78, 205, 196, 0.3)",
        }}
      >
        <div
          style={{ fontSize: "11px", color: "#4ecdc4", marginBottom: "2px" }}
        >
          Current Snap Size
        </div>
        <div style={{ fontSize: "16px", fontWeight: "600" }}>
          {snapToGrid ? `${snapSize?.toFixed(2)} units` : "Disabled"}
        </div>
      </div>

      {/* Toggle Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#ccc",
              marginBottom: "6px",
            }}
          >
            Grid Snapping
          </label>
          <button
            onClick={toggleSnapToGrid}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: snapToGrid
                ? "linear-gradient(90deg, #4ecdc4, #44b3a8)"
                : "rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {snapToGrid ? "ON" : "OFF"}
          </button>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#ccc",
              marginBottom: "6px",
            }}
          >
            Show Grid
          </label>
          <button
            onClick={toggleGridVisible}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: gridVisible
                ? "linear-gradient(90deg, #4ecdc4, #44b3a8)"
                : "rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {gridVisible ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Grid Size Control */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "6px",
          }}
        >
          Base Grid Size
        </label>
        <input
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={gridSize}
          onChange={(e) => setGridSize(parseFloat(e.target.value) || 1)}
          style={{
            width: "100%",
            padding: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            color: "white",
            fontSize: "12px",
            outline: "none",
          }}
        />
      </div>

      {/* Subdivision Presets */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "8px",
          }}
        >
          Snap Precision
        </label>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}
        >
          {subdivisionPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setGridSubdivisions(preset.value)}
              style={{
                padding: "8px 12px",
                background:
                  gridSubdivisions === preset.value
                    ? "rgba(78, 205, 196, 0.3)"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  gridSubdivisions === preset.value
                    ? "1px solid rgba(78, 205, 196, 0.6)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: "white",
                fontSize: "11px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{preset.label}</span>
              <span style={{ color: "#888", fontSize: "10px" }}>
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Subdivisions */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "6px",
          }}
        >
          Custom Subdivisions (1-10)
        </label>
        <input
          type="number"
          min="1"
          max="10"
          step="1"
          value={gridSubdivisions}
          onChange={(e) => setGridSubdivisions(parseInt(e.target.value) || 1)}
          style={{
            width: "100%",
            padding: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            color: "white",
            fontSize: "12px",
            outline: "none",
          }}
        />
      </div>

      {/* Help Text */}
      <div
        style={{
          fontSize: "10px",
          color: "#888",
          padding: "8px",
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "6px",
          lineHeight: "1.4",
        }}
      >
        <strong>Tip:</strong> Use higher subdivisions for precise placement.
        Grid lines show both main grid (bold) and subdivisions (faint). Shapes
        will snap to subdivision points when moving.
      </div>
    </div>
  );
};

export default GridControls;
