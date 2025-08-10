import { useRef, useMemo } from "react";
import * as THREE from "three";

const Grid = ({ size = 20, gridSize = 1 }) => {
  const gridRef = useRef();

  const gridGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const halfSize = (size * gridSize) / 2;

    // Vertical lines
    for (let i = 0; i <= size; i++) {
      const x = -halfSize + i * gridSize;
      vertices.push(x, 0, -halfSize);
      vertices.push(x, 0, halfSize);
    }

    // Horizontal lines
    for (let i = 0; i <= size; i++) {
      const z = -halfSize + i * gridSize;
      vertices.push(-halfSize, 0, z);
      vertices.push(halfSize, 0, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [size, gridSize]);

  return (
    <line ref={gridRef} geometry={gridGeometry}>
      <lineBasicMaterial color="#444444" transparent opacity={0.3} />
    </line>
  );
};

export default Grid;
