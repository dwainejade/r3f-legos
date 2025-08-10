import  { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import useBrickStore from "store/useBrickStore";
import  {
  BRICK_HEIGHT,
  BRICK_TYPES,
  LEGO_UNIT,
} from "store/useBrickStore";

// Cursor preview brick component
const CursorPreviewBrick = () => {
  const selectedBrickType = useBrickStore((state) => state.selectedBrickType);
  const selectedColor = useBrickStore((state) => state.selectedColor);
  const buildMode = useBrickStore((state) => state.buildMode);

  const meshRef = useRef();
  const studMeshRef = useRef();
  const [mousePosition, setMousePosition] = useState([0, 0, 0]);
  const [isVisible, setIsVisible] = useState(false);
  const { camera, gl } = useThree();

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Create geometry for the selected brick type
  const brickGeometry = useMemo(() => {
    if (!selectedBrickType) return null;

    const dims = BRICK_TYPES[selectedBrickType];
    const width = dims.width * LEGO_UNIT;
    const depth = dims.depth * LEGO_UNIT;
    const height = dims.height * BRICK_HEIGHT;

    return new THREE.BoxGeometry(width, height, depth);
  }, [selectedBrickType]);

  // Create stud geometry and positions
  const { studGeometry, studPositions } = useMemo(() => {
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
  const material = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(selectedColor),
      transparent: true,
      opacity: 0.7,
    });
  }, [selectedColor]);

  // Update mouse position and raycast to find surface
  useFrame(() => {
    if (buildMode !== "place" || !brickGeometry) {
      setIsVisible(false);
      return;
    }

    // Get mouse position from DOM
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();

    // We'll use a more direct approach - listen to mouse events
    // This is a simplified version that updates on frame
    setIsVisible(true);
  });

// Handle mouse move events
  useEffect(() => {
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
        // Snap to stud grid - ALL bricks snap to stud positions
        const gridSize = LEGO_UNIT;
        const snappedX = Math.round(target.x / gridSize) * gridSize;
        const snappedZ = Math.round(target.z / gridSize) * gridSize;

        // Calculate brick bounds for boundary checking
        const dims = BRICK_TYPES[selectedBrickType];
        const brickHalfWidth = (dims.width * LEGO_UNIT) / 2;
        const brickHalfDepth = (dims.depth * LEGO_UNIT) / 2;
        
        // Check if brick is within baseplate bounds
        const baseplateHalfSize = (BASEPLATE_SIZE * LEGO_UNIT) / 2;
        const minX = snappedX - brickHalfWidth;
        const maxX = snappedX + brickHalfWidth;
        const minZ = snappedZ - brickHalfDepth;
        const maxZ = snappedZ + brickHalfDepth;
        
        if (
          minX >= -baseplateHalfSize &&
          maxX <= baseplateHalfSize &&
          minZ >= -baseplateHalfSize &&
          maxZ <= baseplateHalfSize
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
  }


export default CursorPreviewBrick;
