import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stats, Sky } from "@react-three/drei";
import * as THREE from "three";
import { InstancedLegoBricks } from "./LegoBrick";
import Baseplate from "./Baseplate";
import SceneLights from "./SceneLights";
import SceneUI from "ui/SceneUI";
import useBrickStore, {
  BRICK_TYPES,
  LEGO_UNIT,
  BRICK_HEIGHT,
  STUD_HEIGHT,
  STUD_RADIUS,
  BASEPLATE_COLOR,
  BASEPLATE_HEIGHT,
  BASEPLATE_SIZE,
} from "store/useBrickStore";
import { getBrickDefaultColor } from "ui/SceneUI";

// This component must be inside the Canvas tree
function PlaceBrickController({ baseplateRef }) {
  usePlaceBrickOnClick(baseplateRef);
  return null; // no UI
}

function usePlaceBrickOnClick(baseplateRef) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const { selectedBrickType, selectedColor, buildMode, addBrick, snapPoint } =
    useBrickStore();

  useEffect(() => {
    if (!gl || !baseplateRef.current) return;

    const canvas = gl.domElement;

    const onClick = (event) => {
      if (buildMode !== "place") return;

      const rect = canvas.getBoundingClientRect();

      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Intersect baseplate mesh only
      const intersects = raycaster.current.intersectObject(
        baseplateRef.current
      );
      if (intersects.length === 0) return;

      const intersectPoint = intersects[0].point;

      // Use snapPoint from store (which includes collision and stacking)
      const snapResult = snapPoint(intersectPoint);

      if (snapResult.isValid) {
        addBrick({
          type: selectedBrickType,
          color: selectedColor,
          position: snapResult.position,
          rotation: [0, 0, 0], // You can add rotation UI later
        });
      } else {
        // Optional: feedback to user about invalid placement
        console.warn("Invalid placement position");
      }
    };

    canvas.addEventListener("pointerdown", onClick);
    return () => canvas.removeEventListener("pointerdown", onClick);
  }, [
    gl,
    camera,
    baseplateRef,
    selectedBrickType,
    selectedColor,
    buildMode,
    addBrick,
    snapPoint,
  ]);
}

// Enhanced cursor preview brick component using store collision detection
const CursorPreviewBrick = () => {
  const { selectedBrickType, selectedColor, buildMode, snapPoint } =
    useBrickStore();
  const meshRef = useRef();
  const studMeshRef = useRef();
  const [mousePosition, setMousePosition] = useState([0, 0, 0]);
  const [isValid, setIsValid] = useState(false);
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

  // Create material with validity indication
  const material = React.useMemo(() => {
    const baseColor = new THREE.Color(selectedColor);

    // Change material based on validity
    return new THREE.MeshLambertMaterial({
      color: isValid ? baseColor : new THREE.Color(0xff0000), // Red if invalid
      transparent: true,
      opacity: isValid ? 0.7 : 0.5, // More transparent if invalid
    });
  }, [selectedColor, isValid]);

  // Handle mouse move events using store's snapPoint function
  React.useEffect(() => {
    const handleMouseMove = (event) => {
      if (buildMode !== "place" || !brickGeometry) {
        setIsVisible(false);
        return;
      }

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Create a baseplate surface plane for intersection
      const baseplateY = BASEPLATE_HEIGHT / 2;
      const baseplatePlane = new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -baseplateY
      );
      const target = new THREE.Vector3();

      if (raycaster.current.ray.intersectPlane(baseplatePlane, target)) {
        // Use the store's snapPoint function which includes collision detection
        const snapResult = snapPoint(target);

        if (snapResult.isValid) {
          setMousePosition(snapResult.position);
          setIsValid(true);
          setIsVisible(true);
        } else {
          // Still show preview but indicate it's invalid
          // Try to show position even if invalid for user feedback
          const invalidResult = snapPoint(target);
          if (invalidResult.position) {
            setMousePosition(invalidResult.position);
            setIsValid(false);
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
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
  }, [camera, gl, buildMode, brickGeometry, selectedBrickType, snapPoint]);

  if (!isVisible || !brickGeometry || buildMode !== "place") {
    return null;
  }

  return (
    <group position={mousePosition}>
      {/* Add a subtle glow effect for invalid positions */}
      {!isValid && (
        <mesh geometry={brickGeometry}>
          <meshBasicMaterial
            color={0xff0000}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}

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

      {/* Layer indicator for stacking */}
      {isValid &&
        mousePosition[1] > BASEPLATE_HEIGHT / 2 + BRICK_HEIGHT / 2 && (
          <mesh position={[0, -BRICK_HEIGHT / 2 - 0.1, 0]}>
            <ringGeometry args={[LEGO_UNIT * 0.8, LEGO_UNIT * 1.2, 16]} />
            <meshBasicMaterial
              color={0x00ff00}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
    </group>
  );
};

// Main Scene Component
const Scene = () => {
  const setBrickType = useBrickStore((state) => state.setBrickType);
  const setColor = useBrickStore((state) => state.setColor);
  const buildMode = useBrickStore((state) => state.buildMode);
  console.warn("Current build mode:", buildMode);
  const baseplateRef = useRef();

  // usePlaceBrickOnClick(baseplateRef);

  // Initialize default brick type and color on startup
  useEffect(() => {
    // Set initial brick type and color
    setBrickType("2x4");
    setColor(getBrickDefaultColor("2x4"));
  }, [setBrickType, setColor]);

  return (
    <div
      className="scene"
      style={{
        width: "100vw",
        height: "100vh",
        cursor: buildMode === "place" ? "none" : "auto",
      }}
    >
      <Canvas
        camera={{ position: [12, 8, 12], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <SceneLights />
        <Sky
          distance={2000}
          sunPosition={[100, 100, 20]}
          inclination={0.6}
          azimuth={0.25}
        />

        {/* Baseplate with ref */}
        <Baseplate
          ref={baseplateRef}
          size={BASEPLATE_SIZE}
          height={BASEPLATE_HEIGHT}
          color={BASEPLATE_COLOR}
        />

        {/* Bricks */}
        <InstancedLegoBricks />

        {/* Cursor Preview */}
        <CursorPreviewBrick />

        {/* Controls and Stats */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={300}
          target={[0, 0, 0]}
          dampingFactor={0.05}
          enableDamping
        />
        <Stats showPanel={0} />
        <PlaceBrickController baseplateRef={baseplateRef} />
      </Canvas>
      {/* UI Overlay */}
      <div className="scene__overlay">
        <SceneUI />
      </div>
    </div>
  );
};

export default Scene;
