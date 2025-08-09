import useBrickStore from "store/useBrickStore";
import { BRICK_TYPES } from "3d/LegoBrick";

// LEGO color palette
const LEGO_COLORS = [
  { name: "Red", value: "#ff0000" },
  { name: "Blue", value: "#0055bf" },
  { name: "Yellow", value: "#ffd700" },
  { name: "Green", value: "#00af4d" },
  { name: "Orange", value: "#ff8c00" },
  { name: "Purple", value: "#81007b" },
  { name: "Pink", value: "#ff69b4" },
  { name: "Brown", value: "#8b4513" },
  { name: "Gray", value: "#6d6e70" },
  { name: "Dark Gray", value: "#4a4c4e" },
  { name: "Light Gray", value: "#9c9c9c" },
  { name: "White", value: "#f4f4f4" },
];

// Build mode selector component
const BuildModeSelector = () => {
  const { buildMode, setBuildMode } = useBrickStore();

  const modes = [
    { id: "place", label: "Place", icon: "🔧" },
    { id: "select", label: "Select", icon: "👆" },
    { id: "remove", label: "Remove", icon: "🗑️" },
  ];

  return (
    <div style={{ marginBottom: "16px" }}>
      <BuildModeSelector />
      <BrickTypeSelector />
      <ColorPicker />
      <StatsPanel />
      <ActionButtons />
      <HelpText />
    </div>
  );
};

// Scene UI component that includes all UI elements
const SceneUI = () => {
  return (
    <>
      <MainUIPanel />
    </>
  );
};

export default SceneUI;

// Brick type selector component
const BrickTypeSelector = () => {
  const { selectedBrickType, setBrickType } = useBrickStore();

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", color: "#cccccc", marginBottom: "8px" }}>
        Brick Type:
      </div>
      <select
        value={selectedBrickType}
        onChange={(e) => setBrickType(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: "rgba(61, 61, 61, 0.9)",
          color: "white",
          border: "1px solid #404040",
          borderRadius: "6px",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        {Object.keys(BRICK_TYPES).map((type) => {
          const dims = BRICK_TYPES[type];
          return (
            <option key={type} value={type}>
              {type} ({dims.width}×{dims.depth}×{dims.height})
            </option>
          );
        })}
      </select>
    </div>
  );
};

// Color picker component
const ColorPicker = () => {
  const { selectedColor, setColor } = useBrickStore();

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", color: "#cccccc", marginBottom: "8px" }}>
        Color:
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
        }}
      >
        {LEGO_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => setColor(color.value)}
            title={color.name}
            style={{
              width: "32px",
              height: "32px",
              background: color.value,
              border:
                selectedColor === color.value
                  ? "3px solid #00a8cc"
                  : "1px solid #404040",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow:
                selectedColor === color.value
                  ? "0 0 8px rgba(0, 168, 204, 0.5)"
                  : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Stats panel component
const StatsPanel = () => {
  const { bricks, selectedBrickId } = useBrickStore();

  const bricksByType = bricks.reduce((acc, brick) => {
    acc[brick.type] = (acc[brick.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      style={{
        borderTop: "1px solid #404040",
        paddingTop: "16px",
        fontSize: "12px",
        color: "#cccccc",
      }}
    >
      <div
        style={{ marginBottom: "8px", fontWeight: "bold", color: "#ffffff" }}
      >
        📊 Statistics
      </div>
      <div style={{ marginBottom: "4px" }}>
        Total Bricks: <span style={{ color: "#00a8cc" }}>{bricks.length}</span>
      </div>
      <div style={{ marginBottom: "8px" }}>
        Selected:{" "}
        {selectedBrickId ? (
          <span style={{ color: "#ffd700" }}>
            Brick {selectedBrickId.slice(-8)}
          </span>
        ) : (
          <span style={{ color: "#888888" }}>None</span>
        )}
      </div>

      {Object.keys(bricksByType).length > 0 && (
        <div>
          <div style={{ marginBottom: "4px", fontWeight: "bold" }}>
            By Type:
          </div>
          {Object.entries(bricksByType).map(([type, count]) => (
            <div key={type} style={{ fontSize: "11px", marginBottom: "2px" }}>
              {type}: {count}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Action buttons component
const ActionButtons = () => {
  const { clearAll, selectedBrickId, removeBrick } = useBrickStore();

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {selectedBrickId && (
          <button
            onClick={() => removeBrick(selectedBrickId)}
            style={{
              width: "100%",
              padding: "8px",
              background: "#ff8c00",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Remove Selected
          </button>
        )}

        <button
          onClick={clearAll}
          style={{
            width: "100%",
            padding: "8px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

// Help text component
const HelpText = () => {
  return (
    <div
      style={{
        marginTop: "12px",
        fontSize: "11px",
        color: "#888888",
        lineHeight: "1.4",
      }}
    >
      <div>• Click surface to place bricks</div>
      <div>• Click bricks to select them</div>
      <div>• Use mouse to orbit camera</div>
      <div>• Scroll to zoom in/out</div>
    </div>
  );
};

// Main UI panel component
const MainUIPanel = () => {
  return (
    <div
      className="scene__info"
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(45, 45, 45, 0.95)",
        padding: "20px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        minWidth: "280px",
        maxWidth: "320px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "20px",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🧱 LEGO Builder
      </div>
    </div>
  );
};
