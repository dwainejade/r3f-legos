import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { createPhysicsBrick } from "./LegoBrick";
import useBrickStore, {
  LEGO_UNIT,
  STUD_HEIGHT,
  STUD_RADIUS,
} from "store/useBrickStore";

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
  const studInstancedRef = useRef();

  // Update store baseplate size when this component's size changes
  useEffect(() => {
    setBaseplateSize(size);
  }, [size, setBaseplateSize]);

  // Generate baseplate geometry
  const baseplateGeometry = useMemo(() => {
    const width = size * LEGO_UNIT;
    const depth = size * LEGO_UNIT;
    return new THREE.BoxGeometry(width, height, depth);
  }, [size, height]);

  // Create stud geometry and material once
  const studGeometry = useMemo(
    () =>
      new THREE.CylinderGeometry(
        STUD_RADIUS * 0.9, // Slightly smaller for baseplate
        STUD_RADIUS * 0.9,
        STUD_HEIGHT * 0.8, // Slightly shorter
        12
      ),
    []
  );

  const studMaterial = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: color,
        transparent: false,
      }),
    [color]
  );

  // Set matrices for each stud instance
  useEffect(() => {
    if (!studInstancedRef.current) return;

    const instancedMesh = studInstancedRef.current;
    const dummy = new THREE.Object3D();

    const studSpacing = LEGO_UNIT;
    const startX = (-(size - 1) * studSpacing) / 2;
    const startZ = (-(size - 1) * studSpacing) / 2;

    let index = 0;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        dummy.position.set(
          startX + x * studSpacing,
          height / 2 + (STUD_HEIGHT * 0.8) / 2,
          startZ + z * studSpacing
        );
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);
        index++;
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
  }, [size, height]);

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
        material={
          new THREE.MeshLambertMaterial({
            color: color,
            transparent: false,
          })
        }
        position={[0, 0, 0]}
        onClick={handleBaseplateClick}
        receiveShadow
        castShadow
      />

      {/* Instanced studs */}
      <instancedMesh
        ref={studInstancedRef}
        args={[studGeometry, studMaterial, size * size]}
        castShadow
      />

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
