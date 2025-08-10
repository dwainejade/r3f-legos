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
  // New shapes
  "1x3": "#20b2aa", // Light Sea Green
  "1x6": "#dc143c", // Crimson
  "1x8": "#8a2be2", // Blue Violet
  "2x3": "#ff1493", // Deep Pink
  "3x3": "#32cd32", // Lime Green
  "4x4": "#ff4500", // Orange Red
  "3x6": "#4169e1", // Royal Blue
  "4x8": "#ff6347", // Tomato
  // Specialty shapes
  corner: "#8b4513", // Saddle Brown
  slope: "#9932cc", // Dark Orchid
  arch: "#008b8b", // Dark Cyan
  round: "#b22222", // Fire Brick
  wedge: "#556b2f", // Dark Olive Green
};

// Expanded brick types with more shapes
const EXPANDED_BRICK_TYPES = {
  ...BRICK_TYPES,
  // Additional rectangular bricks
  "1x3": { width: 1, depth: 3, height: 1 },
  "1x6": { width: 1, depth: 6, height: 1 },
  "1x8": { width: 1, depth: 8, height: 1 },
  "2x3": { width: 2, depth: 3, height: 1 },
  "3x3": { width: 3, depth: 3, height: 1 },
  "4x4": { width: 4, depth: 4, height: 1 },
  "3x6": { width: 3, depth: 6, height: 1 },
  "4x8": { width: 4, depth: 8, height: 1 },
  // Specialty shapes
  corner: { width: 2, depth: 2, height: 1, shape: "corner" },
  slope: { width: 2, depth: 2, height: 2, shape: "slope" },
  arch: { width: 3, depth: 1, height: 3, shape: "arch" },
  round: { width: 2, depth: 2, height: 1, shape: "round" },
  wedge: { width: 2, depth: 3, height: 1, shape: "wedge" },
};

// Get default color for a brick type
export const getBrickDefaultColor = (brickType) => {
  return BRICK_SIZE_COLORS[brickType] || "#6d6e70";
};

// Individual brick preview component
const BrickPreview = ({ type, isSelected, onClick }) => {
  const dims = EXPANDED_BRICK_TYPES[type];
  const color = getBrickDefaultColor(type);
  const isSpecialty = dims.shape !== undefined;

  // Calculate visual representation size based on brick dimensions
  const baseSize = 16;
  const maxSize = 36;
  const width = Math.min(
    Math.max(baseSize + dims.width * 4, baseSize),
    maxSize
  );
  const height = Math.min(
    Math.max(baseSize + dims.depth * 4, baseSize),
    maxSize
  );

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 6px",
        background: isSelected ? "rgba(0, 168, 204, 0.2)" : "transparent",
        border: isSelected
          ? "2px solid #00a8cc"
          : "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: "60px",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
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
            borderRadius: "6px",
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
          borderRadius: isSpecialty ? "50%" : "3px",
          border: "1px solid rgba(0, 0, 0, 0.4)",
          position: "relative",
          marginBottom: "4px",
          boxShadow: isSelected
            ? `0 2px 6px rgba(0, 0, 0, 0.3), 0 0 12px ${color}44`
            : "0 1px 3px rgba(0, 0, 0, 0.2)",
          clipPath:
            isSpecialty && dims.shape === "wedge"
              ? "polygon(0 100%, 100% 100%, 50% 0)"
              : "none",
        }}
      >
        {/* Special shape indicators */}
        {isSpecialty && dims.shape === "arch" && (
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "20%",
              right: "20%",
              bottom: "40%",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "50% 50% 0 0",
            }}
          />
        )}
        {isSpecialty && dims.shape === "slope" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(45deg, transparent 40%, ${color}aa 50%)`,
              borderRadius: "3px",
            }}
          />
        )}
      </div>

      {/* Brick type label */}
      <div
        style={{
          fontSize: "9px",
          color: isSelected ? "#ffffff" : "#cccccc",
          fontWeight: isSelected ? "bold" : "500",
          textAlign: "center",
          textShadow: isSelected ? "0 1px 2px rgba(0, 0, 0, 0.5)" : "none",
          lineHeight: 1.2,
        }}
      >
        {type}
      </div>
    </div>
  );
};

// Category organization
const SHAPE_CATEGORIES = {
  Basic: ["1x1", "1x2", "1x4", "2x2", "2x4"],
  Extended: ["1x3", "1x6", "1x8", "2x3", "2x6", "2x8"],
  Large: ["3x3", "4x4", "3x6", "4x8"],
  Special: ["corner", "slope", "arch", "round", "wedge"],
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
        background: "rgba(45, 45, 45, 0.95)",
        padding: "12px 20px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        width: "90vw",
        maxWidth: "1200px",
        minWidth: "800px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#ffffff",
          }}
        >
          🧱 Pick a Shape
        </div>

        {/* Selected brick info - compact */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "6px 12px",
            background: "rgba(0, 168, 204, 0.1)",
            borderRadius: "6px",
            border: "1px solid rgba(0, 168, 204, 0.3)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#cccccc" }}>
            Selected:{" "}
            <span style={{ fontWeight: "bold", color: "#ffffff" }}>
              {selectedBrickType}
            </span>
          </div>
          <div
            style={{
              width: "16px",
              height: "16px",
              background: getBrickDefaultColor(selectedBrickType),
              borderRadius: "3px",
              border: "1px solid rgba(0, 0, 0, 0.3)",
            }}
          />
        </div>
      </div>

      {/* Shape categories in horizontal layout */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {Object.entries(SHAPE_CATEGORIES).map(([category, shapes]) => (
          <div key={category} style={{ minWidth: "fit-content" }}>
            <div
              style={{
                fontSize: "10px",
                color: "#888",
                marginBottom: "6px",
                textAlign: "center",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                gap: "4px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: "250px",
              }}
            >
              {shapes.map((type) => (
                <BrickPreview
                  key={type}
                  type={type}
                  isSelected={selectedBrickType === type}
                  onClick={() => handleBrickSelect(type)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrickPicker;
