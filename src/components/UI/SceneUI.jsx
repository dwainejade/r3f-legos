import useBrickStore, { BRICK_TYPES } from "store/useBrickStore";

// Define consistent colors for brick sizes (same as BrickPicker)
const BRICK_SIZE_COLORS = {
  "1x1": "#ff0000", // Red
  "1x2": "#0055bf", // Blue
  "1x4": "#00af4d", // Green
  "2x2": "#ffd700", // Yellow
  "2x4": "#ff8c00", // Orange
  "2x6": "#81007b", // Purple
  "2x8": "#ff69b4", // Pink
};

// Get default color for a brick type
export const getBrickDefaultColor = (brickType) => {
  return BRICK_SIZE_COLORS[brickType] || "#6d6e70";
};

// Individual brick size button component
const BrickSizeButton = ({ type, isSelected, onClick }) => {
  const dims = BRICK_TYPES[type];
  const color = getBrickDefaultColor(type);

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 16px",
        background: isSelected
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(255, 255, 255, 0.05)",
        border: isSelected ? `2px solid ${color}` : "2px solid transparent",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: "80px",
        height: "80px",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          e.currentTarget.style.transform = "translateY(0)";
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
            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
            borderRadius: "6px",
            zIndex: 0,
          }}
        />
      )}

      {/* Brick visual representation */}
      <div
        style={{
          width: "32px",
          height: "24px",
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          borderRadius: "3px",
          border: "1px solid rgba(0, 0, 0, 0.3)",
          position: "relative",
          marginBottom: "6px",
          boxShadow: isSelected
            ? `0 2px 8px ${color}66`
            : "0 1px 3px rgba(0, 0, 0, 0.3)",
          zIndex: 1,
        }}
      >
        {/* Studs visualization */}
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: "2px",
            right: "2px",
            bottom: "2px",
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(dims.width, 4)}, 1fr)`,
            gridTemplateRows: `repeat(${Math.min(dims.depth, 3)}, 1fr)`,
            gap: "1px",
          }}
        >
          {Array.from({
            length: Math.min(dims.width * dims.depth, 12),
          }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 255, 255, 0.4)",
                borderRadius: "50%",
                border: "1px solid rgba(0, 0, 0, 0.2)",
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
          zIndex: 1,
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        {type}
      </div>
    </button>
  );
};

// Build mode toggle component
const BuildModeToggle = () => {
  const { buildMode, setBuildMode } = useBrickStore();

  const modes = [
    { id: "place", label: "Build", icon: "🔨" },
    { id: "select", label: "Select", icon: "👆" },
    { id: "remove", label: "Demolish", icon: "💥" },
  ];

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setBuildMode(mode.id)}
          style={{
            padding: "8px 12px",
            background:
              buildMode === mode.id
                ? "rgba(0, 168, 204, 0.8)"
                : "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            border:
              buildMode === mode.id
                ? "2px solid #00a8cc"
                : "2px solid transparent",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s ease",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          }}
          onMouseEnter={(e) => {
            if (buildMode !== mode.id) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (buildMode !== mode.id) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }
          }}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

// Stats display component
const StatsDisplay = () => {
  const { bricks, selectedBrickId } = useBrickStore();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 16px",
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: "6px",
        minWidth: "120px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#cccccc",
          marginBottom: "2px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        Total Bricks
      </div>
      <div
        style={{
          fontSize: "18px",
          color: "#00a8cc",
          fontWeight: "bold",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        {bricks.length}
      </div>
      {selectedBrickId && (
        <div
          style={{
            fontSize: "9px",
            color: "#ffd700",
            marginTop: "2px",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        >
          Selected
        </div>
      )}
    </div>
  );
};

// Action buttons component
const ActionButtons = () => {
  const { clearAll, selectedBrickId, removeBrick } = useBrickStore();

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      {selectedBrickId && (
        <button
          onClick={() => removeBrick(selectedBrickId)}
          style={{
            padding: "8px 12px",
            background: "rgba(255, 140, 0, 0.8)",
            color: "white",
            border: "2px solid #ff8c00",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "bold",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 140, 0, 1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 140, 0, 0.8)";
          }}
        >
          🗑️ Remove
        </button>
      )}

      <button
        onClick={clearAll}
        style={{
          padding: "8px 12px",
          background: "rgba(220, 53, 69, 0.8)",
          color: "white",
          border: "2px solid #dc3545",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: "bold",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(220, 53, 69, 1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(220, 53, 69, 0.8)";
        }}
      >
        🧹 Clear All
      </button>
    </div>
  );
};

// Main bottom toolbar component
const BottomToolbar = () => {
  const { selectedBrickType, setBrickType, setColor } = useBrickStore();

  const handleBrickSelect = (type) => {
    const newColor = getBrickDefaultColor(type);
    setBrickType(type);
    setColor(newColor);

    // Debug log to ensure colors are being set correctly
    console.log(`Selected brick type: ${type}, Color: ${newColor}`);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background:
          "linear-gradient(to top, rgba(20, 20, 20, 0.95), rgba(40, 40, 40, 0.9))",
        backdropFilter: "blur(10px)",
        borderTop: "2px solid rgba(255, 255, 255, 0.1)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
      }}
    >
      {/* Left section - Build modes */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "bold",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        >
          🧱 LEGO Builder
        </div>
        <BuildModeToggle />
      </div>

      {/* Center section - Brick size selection */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flex: 1,
          justifyContent: "center",
          maxWidth: "600px",
        }}
      >
        {Object.keys(BRICK_TYPES).map((type) => (
          <BrickSizeButton
            key={type}
            type={type}
            isSelected={selectedBrickType === type}
            onClick={() => handleBrickSelect(type)}
          />
        ))}
      </div>

      {/* Right section - Stats and actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <StatsDisplay />
        <ActionButtons />
      </div>
    </div>
  );
};

// Scene UI component
const SceneUI = () => {
  return <BottomToolbar />;
};

export default SceneUI;
