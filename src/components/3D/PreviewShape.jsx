import { useState, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useShapeStore } from "store/useShapeStore";
import { snapPositionToGrid } from "utils/gridUtils";

const PreviewShape = () => {
  const [previewPosition, setPreviewPosition] = useState([0, 0, 0]);
  const [isVisible, setIsVisible] = useState(false);
  const { camera, gl } = useThree();
  const { gridSize, editorMode } = useShapeStore();

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const handleMouseMove = (event) => {
      // Only show preview in add mode
      if (editorMode !== "add") {
        setIsVisible(false);
        return;
      }

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Intersect with ground plane
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();

      if (raycaster.current.ray.intersectPlane(groundPlane, target)) {
        const snappedPosition = snapPositionToGrid(
          [target.x, 0.5, target.z],
          gridSize
        );
        setPreviewPosition(snappedPosition);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    const canvas = gl.domElement;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [camera, gl, gridSize, editorMode]);

  if (!isVisible || editorMode !== "add") return null;

  return (
    <mesh position={previewPosition}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color="#ffffff" transparent opacity={0.3} />
    </mesh>
  );
};

export default PreviewShape;
