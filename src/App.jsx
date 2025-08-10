import Scene from "components/3D/Scene";
import EditorModeSelector from "components/UI/EditorModeSelector";
import TransformModeSelector from "components/UI/TransformModeSelector";
import PropertyPanel from "components/UI/PropertyPanel";
import Toolbar from "components/UI/Toolbar";

const GeometryBuilder = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#1a1a1a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D Scene */}
      <Scene />

      {/* UI Overlay */}
      <EditorModeSelector />
      <TransformModeSelector />
      <PropertyPanel />
      <Toolbar />
    </div>
  );
};

export default GeometryBuilder;
