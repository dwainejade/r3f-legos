import { useRef, useMemo, useEffect } from "react";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useShapeStore } from "store/useShapeStore";

const Shape = ({ shape, isSelected, onSelect, onRemove }) => {
  const meshRef = useRef();
  const { updateShape, transformMode, editorMode, getSnapSize } =
    useShapeStore();

  const geometry = useMemo(() => {
    switch (shape.type) {
      case "cube":
        return new THREE.BoxGeometry(
          shape.dimensions.width,
          shape.dimensions.height,
          shape.dimensions.depth
        );
      case "cylinder":
        return new THREE.CylinderGeometry(
          shape.dimensions.radius,
          shape.dimensions.radius,
          shape.dimensions.height,
          32
        );
      case "sphere":
        return new THREE.SphereGeometry(shape.dimensions.radius, 32, 16);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [shape.type, shape.dimensions]);

  const material = useMemo(() => {
    let color = shape.color;
    let opacity = 1.0;

    if (editorMode === "remove") {
      color = "#ff4444";
      opacity = 0.8;
    } else if (isSelected) {
      opacity = 0.8;
    }

    return new THREE.MeshLambertMaterial({
      color,
      transparent: opacity < 1.0,
      opacity,
    });
  }, [shape.color, isSelected, editorMode]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...shape.position);
      meshRef.current.rotation.set(...shape.rotation);
      meshRef.current.scale.set(...shape.scale);
    }
  }, [shape.position, shape.rotation, shape.scale]);

  const handlePointerDown = (event) => {
    event.stopPropagation();

    if (editorMode === "remove") {
      onRemove(shape.id);
    } else if (editorMode === "select") {
      onSelect(shape.id);
    }
  };

  // Perfect grid snapping function
  const snapToGridPerfect = (value, snapSize) => {
    if (!snapSize) return value;
    return Math.round(value / snapSize) * snapSize;
  };

  const handleTransformChange = () => {
    if (meshRef.current && isSelected && editorMode === "select") {
      const snapSize = getSnapSize();

      // Handle position snapping (translation)
      let newPosition;
      if (transformMode === "translate" && snapSize) {
        newPosition = [
          snapToGridPerfect(meshRef.current.position.x, snapSize),
          snapToGridPerfect(meshRef.current.position.y, snapSize),
          snapToGridPerfect(meshRef.current.position.z, snapSize),
        ];

        // Apply snapped position back to mesh for immediate visual feedback
        meshRef.current.position.set(...newPosition);
      } else {
        newPosition = [
          meshRef.current.position.x,
          meshRef.current.position.y,
          meshRef.current.position.z,
        ];
      }

      // Handle rotation snapping
      let newRotation;
      if (transformMode === "rotate") {
        newRotation = [
          meshRef.current.rotation.x,
          meshRef.current.rotation.y,
          meshRef.current.rotation.z,
        ];
      } else {
        newRotation = [
          meshRef.current.rotation.x,
          meshRef.current.rotation.y,
          meshRef.current.rotation.z,
        ];
      }

      // Handle scale snapping
      let newScale;
      if (transformMode === "scale") {
        const scaleSnapSize = 0.1; // You can make this configurable too
        newScale = [
          snapToGridPerfect(meshRef.current.scale.x, scaleSnapSize),
          snapToGridPerfect(meshRef.current.scale.y, scaleSnapSize),
          snapToGridPerfect(meshRef.current.scale.z, scaleSnapSize),
        ];

        // Apply snapped scale back to mesh
        meshRef.current.scale.set(...newScale);
      } else {
        newScale = [
          meshRef.current.scale.x,
          meshRef.current.scale.y,
          meshRef.current.scale.z,
        ];
      }

      updateShape(shape.id, {
        position: newPosition,
        rotation: newRotation,
        scale: newScale,
      });
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onPointerDown={handlePointerDown}
        castShadow
        receiveShadow
      />

      {/* Transform Controls with perfect grid snapping */}
      {isSelected && editorMode === "select" && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          onObjectChange={handleTransformChange}
          showX={true}
          showY={true}
          showZ={true}
          space="world"
          size={0.8}
          translationSnap={transformMode === "translate" ? getSnapSize() : null}
          rotationSnap={transformMode === "rotate" ? Math.PI / 4 : null}
          scaleSnap={transformMode === "scale" ? 0.1 : null}
        />
      )}
    </group>
  );
};

export default Shape;
