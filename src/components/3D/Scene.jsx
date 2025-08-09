import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import {
  InstancedLegoBricks,
  BrickPlacer,
  createPhysicsBrick,
} from "./LegoBrick";
import SceneLights from "./SceneLights";
import SceneUI from "ui/SceneUI";
import useBrickStore from "store/useBrickStore";

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
  const { bricks } = useBrickStore();

  // Initialize demo bricks if none exist
  useEffect(() => {
    if (bricks.length === 0) {
      const demoBricks = [
        {
          type: "2x4",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          color: "#ff0000",
        },
        {
          type: "2x2",
          position: [2, 0, 0],
          rotation: [0, 0, 0],
          color: "#0055bf",
        },
        {
          type: "1x2",
          position: [0, 1, 0],
          rotation: [0, 0, 0],
          color: "#ffd700",
        },
        {
          type: "1x1",
          position: [-1, 0, 0],
          rotation: [0, 0, 0],
          color: "#00af4d",
        },
        {
          type: "2x6",
          position: [0, 0, -3],
          rotation: [0, 0, 0],
          color: "#ff8c00",
        },
      ].map(createPhysicsBrick);

      demoBricks.forEach((brick) => useBrickStore.getState().addBrick(brick));
    }
  }, [bricks.length]);

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
