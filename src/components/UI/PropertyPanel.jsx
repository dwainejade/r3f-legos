import { useShapeStore } from "store/useShapeStore";

const PropertyPanel = () => {
  const {
    getSelectedShape,
    updateShape,
    removeShape,
    selectedShapeId,
    editorMode,
  } = useShapeStore();
  const selectedShape = getSelectedShape();

  if (!selectedShape || editorMode !== "select") {
    return (
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "rgba(45, 45, 45, 0.95)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
          fontFamily: "Inter, sans-serif",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          minWidth: "280px",
        }}
      >
        <h3
          style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "bold" }}
        >
          🎯 Shape Properties
        </h3>
        {editorMode === "add" && (
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            Click on empty space to add new shapes.
          </p>
        )}
        {editorMode === "remove" && (
          <p style={{ color: "#ff8888", fontSize: "14px", margin: 0 }}>
            Click on shapes to delete them.
          </p>
        )}
        {editorMode === "select" && (
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            Click on a shape to select and edit its properties.
          </p>
        )}
      </div>
    );
  }

  const handleDimensionChange = (dimension, value) => {
    const newDimensions = {
      ...selectedShape.dimensions,
      [dimension]: Math.max(0.1, parseFloat(value) || 0.1),
    };
    updateShape(selectedShape.id, { dimensions: newDimensions });
  };

  const handleColorChange = (color) => {
    updateShape(selectedShape.id, { color });
  };

  const handleDelete = () => {
    removeShape(selectedShape.id);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(45, 45, 45, 0.95)",
        padding: "20px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        minWidth: "280px",
      }}
    >
      <h3
        style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "bold" }}
      >
        🎯 Shape Properties
      </h3>

      {/* Shape Type */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "4px",
          }}
        >
          Type
        </label>
        <div
          style={{
            padding: "8px 12px",
            background: "rgba(0, 168, 204, 0.2)",
            borderRadius: "6px",
            fontSize: "14px",
            textTransform: "capitalize",
          }}
        >
          {selectedShape.type}
        </div>
      </div>

      {/* Base Dimensions */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "8px",
          }}
        >
          Base Dimensions
        </label>

        {selectedShape.type === "cube" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            <div>
              <label style={{ fontSize: "10px", color: "#aaa" }}>Width</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedShape.dimensions.width}
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "12px",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "#aaa" }}>Height</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedShape.dimensions.height}
                onChange={(e) =>
                  handleDimensionChange("height", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "12px",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "#aaa" }}>Depth</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedShape.dimensions.depth}
                onChange={(e) => handleDimensionChange("depth", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Transform Info */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "8px",
          }}
        >
          Transform
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "10px",
          }}
        >
          <div>
            <label style={{ color: "#aaa" }}>Position (X, Y, Z)</label>
            <div
              style={{
                padding: "4px 6px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "4px",
                color: "#ccc",
              }}
            >
              {selectedShape.position.map((v) => v.toFixed(1)).join(", ")}
            </div>
          </div>

          <div>
            <label style={{ color: "#aaa" }}>Scale (X, Y, Z)</label>
            <div
              style={{
                padding: "4px 6px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "4px",
                color: "#ccc",
              }}
            >
              {selectedShape.scale.map((v) => v.toFixed(2)).join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* Color */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "8px",
          }}
        >
          Color
        </label>
        <input
          type="color"
          value={selectedShape.color}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{
            width: "100%",
            height: "40px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleDelete}
          style={{
            flex: 1,
            padding: "10px",
            background: "rgba(220, 53, 69, 0.8)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default PropertyPanel;
