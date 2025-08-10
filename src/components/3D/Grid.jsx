import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useShapeStore } from "store/useShapeStore";

const Grid = ({ size = 20 }) => {
  const gridRef = useRef();
  const subGridRef = useRef();

  const { gridSize, gridSubdivisions, gridVisible } = useShapeStore();

  // Calculate actual snap size
  const snapSize = gridSize / gridSubdivisions;

  // Main grid lines (every gridSize units)
  const mainGridGeometry = useMemo(() => {
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

  // Subdivision grid lines (finer grid)
  const subGridGeometry = useMemo(() => {
    if (gridSubdivisions <= 1) return null;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const totalLines = size * gridSubdivisions;
    const halfSize = (size * gridSize) / 2;

    // Vertical subdivision lines
    for (let i = 0; i <= totalLines; i++) {
      // Skip main grid lines (they're drawn separately)
      if (i % gridSubdivisions === 0) continue;

      const x = -halfSize + i * snapSize;
      vertices.push(x, 0, -halfSize);
      vertices.push(x, 0, halfSize);
    }

    // Horizontal subdivision lines
    for (let i = 0; i <= totalLines; i++) {
      // Skip main grid lines
      if (i % gridSubdivisions === 0) continue;

      const z = -halfSize + i * snapSize;
      vertices.push(-halfSize, 0, z);
      vertices.push(halfSize, 0, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [size, gridSize, gridSubdivisions, snapSize]);

  if (!gridVisible) return null;

  return (
    <group>
      {/* Main grid lines - more prominent */}
      <line ref={gridRef} geometry={mainGridGeometry}>
        <lineBasicMaterial
          color="#666666"
          transparent
          opacity={0.4}
          linewidth={1}
        />
      </line>

      {/* Subdivision grid lines - subtle */}
      {subGridGeometry && (
        <line ref={subGridRef} geometry={subGridGeometry}>
          <lineBasicMaterial
            color="#333333"
            transparent
            opacity={0.2}
            linewidth={0.5}
          />
        </line>
      )}

      {/* Origin axes - highlight the center */}
      <group>
        {/* X-axis line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={
                new Float32Array([
                  (-size / 2) * gridSize,
                  0,
                  0,
                  (size / 2) * gridSize,
                  0,
                  0,
                ])
              }
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff6b35" transparent opacity={0.6} />
        </line>

        {/* Z-axis line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={
                new Float32Array([
                  0,
                  0,
                  (-size / 2) * gridSize,
                  0,
                  0,
                  (size / 2) * gridSize,
                ])
              }
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#4ecdc4" transparent opacity={0.6} />
        </line>
      </group>
    </group>
  );
};

export default Grid;
