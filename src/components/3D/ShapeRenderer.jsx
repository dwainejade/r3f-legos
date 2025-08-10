import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useShapeStore } from "store/useShapeStore";
import { snapPositionToGrid } from "utils/gridUtils";
import Shape from "./Shape";
import PreviewShape from "./PreviewShape";

const ShapeRenderer = () => {
  const {
    shapes,
    selectedShapeId,
    selectShape,
    addShape,
    removeShape,
    gridSize,
    editorMode,
  } = useShapeStore();
  const { camera, gl } = useThree();

  const handleCanvasClick = (event) => {
    // Only add shapes in add mode when clicking empty space
    if (editorMode !== "add" || event.target !== gl.domElement) return;

    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(groundPlane, target)) {
      const snappedPosition = snapPositionToGrid(
        [target.x, 0.5, target.z],
        gridSize
      );

      const newShape = {
        type: "cube",
        position: snappedPosition,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        dimensions: { width: 1, height: 1, depth: 1 },
        color: "#ff6b35",
      };

      addShape(newShape);
    }
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("click", handleCanvasClick);
    return () => canvas.removeEventListener("click", handleCanvasClick);
  }, [gl, camera, addShape, gridSize, editorMode]);

  return (
    <group>
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          shape={shape}
          isSelected={shape.id === selectedShapeId}
          onSelect={selectShape}
          onRemove={removeShape}
        />
      ))}
      <PreviewShape />
    </group>
  );
};

export default ShapeRenderer;
