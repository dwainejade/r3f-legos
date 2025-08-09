import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import {
  InstancedLegoBricks,
  BrickPlacer,
  createPhysicsBrick,
} from "./LegoBrick";
import CursorPreviewBrick from "./PreviewBrick";
import SceneLights from "./SceneLights";
import SceneUI from "ui/SceneUI";
import useBrickStore from "store/useBrickStore";
import { getBrickDefaultColor } from "ui/BrickPicker";

// Grid helper component
const GridHelper = ({ size = 20, divisions = 20, colorGrid = "#404040" }) => {
  return (
    <gridHelper
      args={[size, divisions, colorGrid, colorGrid]}
      position={[0, -0.49, 0]}
    />
  );
};

// Main Scene Component
const Scene = () => {
  const { bricks, setBrickType, setColor } = useBrickStore();

  // Initialize default brick type and color on startup
  useEffect(() => {
    // Set initial brick type and color
    setBrickType("2x4");
    setColor(getBrickDefaultColor("2x4"));
  }, [setBrickType, setColor]);

  return (
    <div
      className="scene"
      style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}
    >
      <Canvas
        camera={{ position: [8, 6, 8], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting System */}
        <SceneLights />

        {/* Building Surface */}
        <BrickPlacer />

        {/* Grid Helper */}
        <GridHelper />

        {/* LEGO Bricks */}
        <InstancedLegoBricks />

        {/* Cursor Preview Brick */}
        <CursorPreviewBrick />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
          target={[0, 0, 0]}
          dampingFactor={0.05}
          enableDamping={true}
        />

        {/* Performance Stats */}
        <Stats showPanel={0} className="stats" />
      </Canvas>

      {/* UI Overlay */}
      <div className="scene__overlay">
        <SceneUI />
      </div>
    </div>
  );
};

export default Scene;
