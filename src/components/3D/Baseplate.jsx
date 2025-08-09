import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { createPhysicsBrick } from "./LegoBrick";
import useBrickStore, {
  LEGO_UNIT,
  STUD_HEIGHT,
  STUD_RADIUS,
} from "store/useBrickStore";

// Create baseplate with studs
const Baseplate = ({
  size = 32, // studs (default 32x32)
  height = 0.32, // default thinner than regular bricks
  color = "#00aa00", // default classic green
}) => {
  const {
    selectedBrickType,
    selectedColor,
    buildMode,
    addBrick,
    snapPoint,
    setBaseplateSize,
  } = useBrickStore();

  const baseplateRef = useRef();
  const studMeshRef = useRef();

  // Update store baseplate size when this component's size changes
  React.useEffect(() => {
    setBaseplateSize(size);
  }, [size, setBaseplateSize]);

  // Generate baseplate geometry
  const baseplateGeometry = useMemo(() => {
    const width = size * LEGO_UNIT;
    const depth = size * LEGO_UNIT;
    return new THREE.BoxGeometry(width, height, depth);
  }, [size, height]);

  // Generate stud positions and geometry
  const { studGeometry, studPositions } = useMemo(() => {
    const studGeo = new THREE.CylinderGeometry(
      STUD_RADIUS * 0.9, // Slightly smaller for baseplate
      STUD_RADIUS * 0.9,
      STUD_HEIGHT * 0.8, // Slightly shorter
      12
    );

    const positions = [];
    const studSpacing = LEGO_UNIT;
    const startX = (-(size - 1) * studSpacing) / 2;
    const startZ = (-(size - 1) * studSpacing) / 2;

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        positions.push([
          startX + x * studSpacing,
          height / 2 + (STUD_HEIGHT * 0.8) / 2,
          startZ + z * studSpacing,
        ]);
      }
    }

    return { studGeometry: studGeo, studPositions: positions };
  }, [size, height]);

  // Materials
  const baseplateMaterial = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: color,
        transparent: false,
      }),
    [color]
  );

  const studMaterial = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: color,
        transparent: false,
      }),
    [color]
  );

  // Handle click on baseplate for placing bricks
  const handleBaseplateClick = (event) => {
    if (buildMode !== "place") return;

    const point = event.point;

    // Use the store's snapPoint function which includes collision detection
    const snapResult = snapPoint(point);

    if (!snapResult.isValid) {
      console.warn("Cannot place brick at this position");
      return; // Brick would extend outside baseplate bounds or collision detected
    }

    const newBrick = createPhysicsBrick({
      type: selectedBrickType,
      position: snapResult.position,
      rotation: [0, 0, 0],
      color: selectedColor,
    });

    addBrick(newBrick);
  };

  return (
    <group>
      {/* Main baseplate */}
      <mesh
        ref={baseplateRef}
        geometry={baseplateGeometry}
        material={baseplateMaterial}
        position={[0, 0, 0]}
        onClick={handleBaseplateClick}
        receiveShadow
        castShadow
      />

      {/* Baseplate studs */}
      {studPositions.map((position, index) => (
        <mesh
          key={index}
          ref={index === 0 ? studMeshRef : undefined}
          geometry={studGeometry}
          material={studMaterial}
          position={position}
          castShadow
        />
      ))}

      {/* Baseplate border (optional visual enhancement) */}
      <mesh position={[0, -height / 4, 0]}>
        <boxGeometry
          args={[size * LEGO_UNIT + 0.1, height / 2, size * LEGO_UNIT + 0.1]}
        />
        <meshLambertMaterial color="#008800" />
      </mesh>
    </group>
  );
};

export default Baseplate;
