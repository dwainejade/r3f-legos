import React, { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import useBrickStore, {
  BRICK_HEIGHT,
  BRICK_TYPES,
  LEGO_UNIT,
} from "store/useBrickStore";

const CursorPreviewBrick = () => {
  const selectedBrickType = useBrickStore((state) => state.selectedBrickType);
  const selectedColor = useBrickStore((state) => state.selectedColor);
  const buildMode = useBrickStore((state) => state.buildMode);
  const baseplateSize = useBrickStore((state) => state.baseplateSize);

  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [position, setPosition] = useState([0, 0, 0]);
  const [isValid, setIsValid] = useState(false);

  // Geometry for the brick preview
  const brickGeometry = React.useMemo(() => {
    if (!selectedBrickType) return null;
    const dims = BRICK_TYPES[selectedBrickType];
    return new THREE.BoxGeometry(
      dims.width * LEGO_UNIT,
      dims.height * BRICK_HEIGHT,
      dims.depth * LEGO_UNIT
    );
  }, [selectedBrickType]);

  // Material changes color based on validity
  const material = React.useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: isValid
        ? new THREE.Color(selectedColor)
        : new THREE.Color(0xff0000),
      transparent: true,
      opacity: 0.7,
    });
  }, [selectedColor, isValid]);

  // Update preview position on mouse move
  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseMove = (event) => {
      if (buildMode !== "place" || !brickGeometry) {
        setIsValid(false);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Plane for the baseplate surface (assume y=0)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();

      if (raycaster.current.ray.intersectPlane(plane, intersectPoint)) {
        // Snap to studs
        const gridSize = LEGO_UNIT;
        const dims = BRICK_TYPES[selectedBrickType];
        const halfWidth = (dims.width * LEGO_UNIT) / 2;
        const halfDepth = (dims.depth * LEGO_UNIT) / 2;

        const snappedX = Math.round(intersectPoint.x / gridSize) * gridSize;
        const snappedZ = Math.round(intersectPoint.z / gridSize) * gridSize;
        const snappedY = (dims.height * BRICK_HEIGHT) / 2; // on top of baseplate (assumed y=0)

        // Check if within baseplate bounds
        const baseHalfSize = (baseplateSize * LEGO_UNIT) / 2;
        const minX = snappedX - halfWidth;
        const maxX = snappedX + halfWidth;
        const minZ = snappedZ - halfDepth;
        const maxZ = snappedZ + halfDepth;

        const valid =
          minX >= -baseHalfSize &&
          maxX <= baseHalfSize &&
          minZ >= -baseHalfSize &&
          maxZ <= baseHalfSize;

        setPosition([snappedX, snappedY, snappedZ]);
        setIsValid(valid);
      } else {
        setIsValid(false);
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, [camera, gl, buildMode, brickGeometry, selectedBrickType, baseplateSize]);

  if (buildMode !== "place" || !brickGeometry) return null;

  return (
    <mesh
      geometry={brickGeometry}
      material={material}
      position={position}
      castShadow
      receiveShadow
    />
  );
};

export default CursorPreviewBrick;
