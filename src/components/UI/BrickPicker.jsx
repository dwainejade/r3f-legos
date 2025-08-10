import useBrickStore, { BRICK_TYPES } from "store/useBrickStore";

// Define consistent colors for brick sizes
const BRICK_SIZE_COLORS = {
  "1x1": "#ff0000", // Red for 1x1
  "1x2": "#0055bf", // Blue for 1x2
  "1x4": "#00af4d", // Green for 1x4
  "2x2": "#ffd700", // Yellow for 2x2
  "2x4": "#ff8c00", // Orange for 2x4
  "2x6": "#81007b", // Purple for 2x6
  "2x8": "#ff69b4", // Pink for 2x8
};

// Get default color for a brick type
export const getBrickDefaultColor = (brickType) => {
  return BRICK_SIZE_COLORS[brickType] || "#6d6e70";
};

// Individual brick preview component
const BrickPreview = ({ type, isSelected, onClick }) => {
  const dims = BRICK_TYPES[type];
  const color = getBrickDefaultColor(type);

  // Calculate visual representation size based on brick dimensions
  const baseSize = 20;
  const maxSize = 48;
  const width = Math.min(
    Math.max(baseSize + dims.width * 8, baseSize),
    maxSize
  );
  const height = Math.min(
    Math.max(baseSize + dims.depth * 8, baseSize),
    maxSize
  );

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 8px",
        background: isSelected ? "rgba(0, 168, 204, 0.2)" : "transparent",
        border: isSelected
          ? "2px solid #00a8cc"
          : "2px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: "80px",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Selection glow effect */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, rgba(0, 168, 204, 0.1), rgba(0, 168, 204, 0.3))",
            borderRadius: "8px",
            zIndex: -1,
          }}
        />
      )}

      {/* Visual brick representation */}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          borderRadius: "4px",
          border: "1px solid rgba(0, 0, 0, 0.4)",
          position: "relative",
          marginBottom: "8px",
          boxShadow: isSelected
            ? `0 4px 8px rgba(0, 0, 0, 0.3), 0 0 16px ${color}44`
            : "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Add studs visualization */}
        <div
          style={{
            position: "absolute",
            top: "3px",
            left: "3px",
            right: "3px",
            bottom: "3px",
            display: "grid",
            gridTemplateColumns: `repeat(${dims.width}, 1fr)`,
            gridTemplateRows: `repeat(${dims.depth}, 1fr)`,
            gap: "2px",
          }}
        >
          {Array.from({ length: dims.width * dims.depth }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 255, 255, 0.4)",
                borderRadius: "50%",
                border: "1px solid rgba(0, 0, 0, 0.3)",
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Brick type label */}
      <div
        style={{
          fontSize: "11px",
          color: isSelected ? "#ffffff" : "#cccccc",
          fontWeight: isSelected ? "bold" : "500",
          textAlign: "center",
          textShadow: isSelected ? "0 1px 2px rgba(0, 0, 0, 0.5)" : "none",
        }}
      >
        {type}
      </div>

      {/* Dimensions */}
      <div
        style={{
          fontSize: "9px",
          color: isSelected ? "#cccccc" : "#888888",
          textAlign: "center",
        }}
      >
        {dims.width}×{dims.depth}×{dims.height}
      </div>
    </div>
  );
};

// Main BrickPicker component
const BrickPicker = () => {
  const { selectedBrickType, setBrickType, setColor } = useBrickStore();

  const handleBrickSelect = (type) => {
    setBrickType(type);
    // Set the color to the default color for this brick type
    setColor(getBrickDefaultColor(type));
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(45, 45, 45, 0.95)",
        padding: "16px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        maxWidth: "400px",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "16px",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#ffffff",
        }}
      >
        🧱 Pick a Brick
      </div>

      {/* Brick grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
          gap: "8px",
          maxWidth: "350px",
        }}
      >
        {Object.keys(BRICK_TYPES).map((type) => (
          <BrickPreview
            key={type}
            type={type}
            isSelected={selectedBrickType === type}
            onClick={() => handleBrickSelect(type)}
          />
        ))}
      </div>

      {/* Selected brick info */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(0, 168, 204, 0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(0, 168, 204, 0.3)",
        }}
      >
        <div
          style={{ fontSize: "12px", color: "#cccccc", marginBottom: "4px" }}
        >
          Selected:
        </div>
        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff" }}>
          {selectedBrickType}
        </div>
        <div style={{ fontSize: "11px", color: "#888888" }}>
          Color: {getBrickDefaultColor(selectedBrickType)}
        </div>
      </div>
    </div>
  );
};

export default BrickPicker;
