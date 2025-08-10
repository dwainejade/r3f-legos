import Scene from "components/3D/Scene";
import EditorModeSelector from "components/UI/EditorModeSelector";
import TransformModeSelector from "components/UI/TransformModeSelector";
import PropertyPanel from "components/UI/PropertyPanel";
import Toolbar from "components/UI/Toolbar";
import GridControls from "./components/UI/GridControls";

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


  {/* UI Panels (conditionally rendered via Toolbar tabs/toggles) */}
  {/* Panels will be toggled from the Toolbar, so only Toolbar is always present */}
  <Toolbar />

      {/* Background Overlay */}
    </div>
  );
};

export default GeometryBuilder;
