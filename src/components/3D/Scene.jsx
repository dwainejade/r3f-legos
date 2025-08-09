import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stats, Sky } from "@react-three/drei";
import * as THREE from "three";
import {
  InstancedLegoBricks,
  BRICK_TYPES,
  LEGO_UNIT,
  BRICK_HEIGHT,
  STUD_HEIGHT,
  STUD_RADIUS,
} from "./LegoBrick";
import Baseplate from "./Baseplate";
import SceneLights from "./SceneLights";
import SceneUI from "ui/SceneUI";
import useBrickStore from "store/useBrickStore";
import { getBrickDefaultColor } from "ui/SceneUI";

// Constants for baseplate (shared with Baseplate component)
const BASEPLATE_SIZE = 64;
const BASEPLATE_HEIGHT = 0.32;
const BASEPLATE_COLOR = "#00aa00";

// Updated PreviewBrick component for baseplate compatibility
const CursorPreviewBrick = () => {
  const { selectedBrickType, selectedColor, buildMode } = useBrickStore();
  const meshRef = useRef();
  const studMeshRef = useRef();
  const [mousePosition, setMousePosition] = useState([0, 0, 0]);
  const [isVisible, setIsVisible] = useState(false);
  const { camera, gl } = useThree();

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Create geometry for the selected brick type
  const brickGeometry = React.useMemo(() => {
    if (!selectedBrickType) return null;

    const dims = BRICK_TYPES[selectedBrickType];
    const width = dims.width * LEGO_UNIT;
    const depth = dims.depth * LEGO_UNIT;
    const height = dims.height * BRICK_HEIGHT;

    return new THREE.BoxGeometry(width, height, depth);
  }, [selectedBrickType]);

  // Create stud geometry and positions
  const { studGeometry, studPositions } = React.useMemo(() => {
    if (!selectedBrickType) return { studGeometry: null, studPositions: [] };

    const dims = BRICK_TYPES[selectedBrickType];
    const studGeo = new THREE.CylinderGeometry(
      STUD_RADIUS,
      STUD_RADIUS,
      STUD_HEIGHT,
      12
    );

    const positions = [];
    const studSpacing = LEGO_UNIT;
    const startX = (-(dims.width - 1) * studSpacing) / 2;
    const startZ = (-(dims.depth - 1) * studSpacing) / 2;

    for (let x = 0; x < dims.width; x++) {
      for (let z = 0; z < dims.depth; z++) {
        positions.push([
          startX + x * studSpacing,
          (dims.height * BRICK_HEIGHT) / 2 + STUD_HEIGHT / 2,
          startZ + z * studSpacing,
        ]);
      }
    }

    return { studGeometry: studGeo, studPositions: positions };
  }, [selectedBrickType]);

  // Create material
  const material = React.useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(selectedColor),
      transparent: true,
      opacity: 0.7,
    });
  }, [selectedColor]);

  // Handle mouse move events
  React.useEffect(() => {
    const handleMouseMove = (event) => {
      if (buildMode !== "place" || !brickGeometry) {
        setIsVisible(false);
        return;
      }

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      // Calculate mouse position in normalized device coordinates
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycaster.current.setFromCamera(mouse.current, camera);

      // Create a baseplate surface plane for intersection
      const baseplateY = BASEPLATE_HEIGHT / 2;
      const baseplatePlane = new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -baseplateY
      );
      const target = new THREE.Vector3();

      // Get intersection with baseplate surface
      if (raycaster.current.ray.intersectPlane(baseplatePlane, target)) {
        // Snap to baseplate grid
        const gridSize = LEGO_UNIT;
        const snappedX = Math.round(target.x / gridSize) * gridSize;
        const snappedZ = Math.round(target.z / gridSize) * gridSize;

        // Check if position is within baseplate bounds
        const halfSize = (BASEPLATE_SIZE * LEGO_UNIT) / 2;
        if (
          Math.abs(snappedX) <= halfSize - LEGO_UNIT / 2 &&
          Math.abs(snappedZ) <= halfSize - LEGO_UNIT / 2
        ) {
          const snappedY = BASEPLATE_HEIGHT / 2 + BRICK_HEIGHT / 2;
          setMousePosition([snappedX, snappedY, snappedZ]);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const canvas = gl.domElement;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [camera, gl, buildMode, brickGeometry]);

  if (!isVisible || !brickGeometry || buildMode !== "place") {
    return null;
  }

  return (
    <group position={mousePosition}>
      {/* Main brick body */}
      <mesh ref={meshRef} geometry={brickGeometry} material={material} />

      {/* Studs */}
      {studPositions.map((pos, index) => (
        <mesh
          key={index}
          ref={index === 0 ? studMeshRef : undefined}
          position={pos}
          geometry={studGeometry}
          material={material}
        />
      ))}
    </group>
  );
};

// Main Scene Component
const Scene = () => {
  const { setBrickType, setColor } = useBrickStore();

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
        camera={{ position: [12, 8, 12], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting System */}
        <SceneLights />
        <Sky
          distance={2000}
          sunPosition={[100, 100, 20]}
          inclination={0.6}
          azimuth={0.25}
        />

        {/* LEGO Baseplate (replaces BrickPlacer and GridHelper) */}
        <Baseplate
          size={BASEPLATE_SIZE}
          height={BASEPLATE_HEIGHT}
          color={BASEPLATE_COLOR}
        />

        {/* LEGO Bricks */}
        <InstancedLegoBricks />

        {/* Cursor Preview Brick */}
        <CursorPreviewBrick />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={300}
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
