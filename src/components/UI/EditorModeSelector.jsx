import { useShapeStore } from "store/useShapeStore";

const EditorModeSelector = () => {
  const { editorMode, setEditorMode } = useShapeStore();

  const modes = [
    {
      id: "add",
      label: "Add",
      icon: "➕",
      description: "Click empty space to add shapes",
      color: "#28a745",
    },
    {
      id: "select",
      label: "Select",
      icon: "👆",
      description: "Click shapes to select and transform",
      color: "#007bff",
    },
    {
      id: "remove",
      label: "Remove",
      icon: "🗑️",
      description: "Click shapes to delete them",
      color: "#dc3545",
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(45, 45, 45, 0.95)",
        padding: "16px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "Inter, sans-serif",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        minWidth: "300px",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#ccc",
        }}
      >
        🛠️ Editor Mode
      </h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setEditorMode(mode.id)}
            style={{
              flex: 1,
              padding: "12px 8px",
              background:
                editorMode === mode.id
                  ? `${mode.color}88`
                  : "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              border:
                editorMode === mode.id
                  ? `2px solid ${mode.color}`
                  : "2px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s ease",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
            }}
            onMouseEnter={(e) => {
              if (editorMode !== mode.id) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (editorMode !== mode.id) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
          >
            <span style={{ fontSize: "16px" }}>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Current mode description */}
      <div
        style={{
          padding: "8px 12px",
          background: "rgba(0, 0, 0, 0.2)",
          borderRadius: "6px",
          fontSize: "11px",
          color: "#ccc",
          textAlign: "center",
        }}
      >
        {modes.find((m) => m.id === editorMode)?.description}
      </div>
    </div>
  );
};

export default EditorModeSelector;
