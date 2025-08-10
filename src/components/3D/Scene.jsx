import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import Grid from "./Grid";
import ShapeRenderer from "./ShapeRenderer";

const Scene = () => {
  return (
    <Canvas
      camera={{ position: [8, 6, 8], fov: 50 }}
      shadows
      gl={{ antialias: true, alpha: false }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Grid */}
      <Grid />

      {/* Shapes with Transform Controls */}
      <ShapeRenderer />

      {/* Ground plane (invisible, for raycasting) */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
        target={[0, 0, 0]}
        makeDefault
      />

      {/* Performance Stats */}
      <Stats />
    </Canvas>
  );
};

export default Scene;
