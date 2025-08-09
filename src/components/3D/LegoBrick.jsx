import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import useBrickStore from "store/useBrickStore";

// LEGO brick dimensions (in LEGO units where 1 unit = 8mm)
export const LEGO_UNIT = 0.8; // Scale factor for Three.js (8mm = 0.8 units)
export const STUD_HEIGHT = 0.17;
export const STUD_RADIUS = 0.24;
export const BRICK_HEIGHT = 0.96; // Standard brick height
export const WALL_THICKNESS = 0.15;

// Define brick type configurations
export const BRICK_TYPES = {
  "1x1": { width: 1, depth: 1, height: 1 },
  "1x2": { width: 1, depth: 2, height: 1 },
  "1x4": { width: 1, depth: 4, height: 1 },
  "2x2": { width: 2, depth: 2, height: 1 },
  "2x4": { width: 2, depth: 4, height: 1 },
  "2x6": { width: 2, depth: 6, height: 1 },
  "2x8": { width: 2, depth: 8, height: 1 },
};

// Physics-ready brick data structure for future integration
export const createPhysicsBrick = (brick) => {
  const dims = BRICK_TYPES[brick.type];
  return {
    ...brick,
    id: crypto.randomUUID(),
    // Physics properties for future use
    physics: {
      mass: dims.width * dims.depth * dims.height * 0.1, // Approximate mass
      friction: 0.8,
      restitution: 0.3,
      collisionShape: "box",
      dimensions: [
        dims.width * LEGO_UNIT,
        dims.height * BRICK_HEIGHT,
        dims.depth * LEGO_UNIT,
      ],
    },
  };
};

// Individual instanced group for each brick type/color combination
const InstancedBrickGroup = React.forwardRef(
  ({ group, geometry, selectedBrickId }, ref) => {
    const meshRef = useRef();
    const studMeshRef = useRef();
    const { instances, color, type } = group;

    // Create materials
    const material = useMemo(() => {
      return new THREE.MeshLambertMaterial({
        color: new THREE.Color(color),
      });
    }, [color]);

    // Create stud geometry
    const studGeometry = useMemo(() => {
      return new THREE.CylinderGeometry(
        STUD_RADIUS,
        STUD_RADIUS,
        STUD_HEIGHT,
        12
      );
    }, []);

    // Calculate stud positions for this brick type
    const studPositionsPerBrick = useMemo(() => {
      const dims = BRICK_TYPES[type];
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
      return positions;
    }, [type]);

    const totalStuds = instances.length * studPositionsPerBrick.length;

    // Update instance matrices for main bricks
    useEffect(() => {
      if (!meshRef.current || !instances.length) return;

      const mesh = meshRef.current;
      mesh.count = instances.length;

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3(1, 1, 1);

      instances.forEach((brick, index) => {
        position.set(brick.position[0], brick.position[1], brick.position[2]);
        quaternion.setFromEuler(
          new THREE.Euler(
            brick.rotation[0],
            brick.rotation[1],
            brick.rotation[2]
          )
        );

        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(index, matrix);

        // Set selection state per instance
        mesh.setColorAt(
          index,
          selectedBrickId === brick.id
            ? new THREE.Color(color).multiplyScalar(1.3)
            : new THREE.Color(color)
        );
      });

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }, [instances, selectedBrickId, color]);

    // Update instance matrices for studs
    useEffect(() => {
      if (
        !studMeshRef.current ||
        !instances.length ||
        !studPositionsPerBrick.length
      )
        return;

      const studMesh = studMeshRef.current;
      studMesh.count = totalStuds;

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3(1, 1, 1);

      let studIndex = 0;
      instances.forEach((brick, brickIndex) => {
        const brickPosition = new THREE.Vector3(
          brick.position[0],
          brick.position[1],
          brick.position[2]
        );
        const brickQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            brick.rotation[0],
            brick.rotation[1],
            brick.rotation[2]
          )
        );

        studPositionsPerBrick.forEach((studPos) => {
          // Transform stud position relative to brick
          const worldStudPos = new THREE.Vector3(
            studPos[0],
            studPos[1],
            studPos[2]
          );
          worldStudPos.applyQuaternion(brickQuaternion);
          worldStudPos.add(brickPosition);

          position.copy(worldStudPos);
          matrix.compose(position, brickQuaternion, scale);
          studMesh.setMatrixAt(studIndex, matrix);

          // Set stud color to match brick
          studMesh.setColorAt(
            studIndex,
            selectedBrickId === brick.id
              ? new THREE.Color(color).multiplyScalar(1.3)
              : new THREE.Color(color)
          );

          studIndex++;
        });
      });

      studMesh.instanceMatrix.needsUpdate = true;
      if (studMesh.instanceColor) {
        studMesh.instanceColor.needsUpdate = true;
      }
    }, [instances, selectedBrickId, color, studPositionsPerBrick, totalStuds]);

    // Expose ref for click detection
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(meshRef);
        } else {
          ref.current = meshRef;
        }
      }
    }, [ref]);

    if (!instances.length || !geometry) return null;

    return (
      <group>
        {/* Main brick bodies */}
        <instancedMesh
          ref={meshRef}
          args={[geometry, material, instances.length]}
          castShadow
          receiveShadow
        >
          <instancedBufferAttribute
            attach="instanceColor"
            args={[new Float32Array(instances.length * 3), 3]}
          />
        </instancedMesh>

        {/* Studs */}
        {totalStuds > 0 && (
          <instancedMesh
            ref={studMeshRef}
            args={[studGeometry, material, totalStuds]}
            castShadow
          >
            <instancedBufferAttribute
              attach="instanceColor"
              args={[new Float32Array(totalStuds * 3), 3]}
            />
          </instancedMesh>
        )}
      </group>
    );
  }
);

// Instanced LEGO Brick System - groups bricks by type and color for optimal performance
export const InstancedLegoBricks = () => {
  const { bricks, selectedBrickId, selectBrick } = useBrickStore();
  const instancedMeshRefs = useRef(new Map());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Group bricks by type and color for instancing
  const brickGroups = useMemo(() => {
    const groups = new Map();

    bricks.forEach((brick) => {
      const key = `${brick.type}-${brick.color}`;
      if (!groups.has(key)) {
        groups.set(key, {
          type: brick.type,
          color: brick.color,
          dimensions: BRICK_TYPES[brick.type],
          instances: [],
        });
      }
      groups.get(key).instances.push(brick);
    });

    return groups;
  }, [bricks]);

  // Create geometries for different brick types
  const geometries = useMemo(() => {
    const geoms = new Map();

    Object.entries(BRICK_TYPES).forEach(([type, dims]) => {
      const width = dims.width * LEGO_UNIT;
      const depth = dims.depth * LEGO_UNIT;
      const height = dims.height * BRICK_HEIGHT;

      // For now, just use the main brick geometry
      // Studs will be rendered separately if needed
      const brickGeometry = new THREE.BoxGeometry(width, height, depth);
      geoms.set(type, brickGeometry);
    });

    return geoms;
  }, []);

  // Handle click interactions
  const handleClick = (event) => {
    // Convert mouse position to normalized device coordinates
    const rect = event.target.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.current.setFromCamera(mouse.current, event.camera);

    // Check intersections with instanced meshes
    let closestIntersection = null;
    let closestDistance = Infinity;
    let clickedBrick = null;

    instancedMeshRefs.current.forEach((meshRef, key) => {
      if (meshRef.current) {
        const intersects = raycaster.current.intersectObject(meshRef.current);

        if (intersects.length > 0) {
          const intersection = intersects[0];
          if (intersection.distance < closestDistance) {
            closestDistance = intersection.distance;
            closestIntersection = intersection;

            // Find which brick instance was clicked
            const group = brickGroups.get(key);
            if (group && intersection.instanceId !== undefined) {
              clickedBrick = group.instances[intersection.instanceId];
            }
          }
        }
      }
    });

    if (clickedBrick) {
      selectBrick(clickedBrick.id);
    } else {
      selectBrick(null);
    }
  };

  return (
    <group onClick={handleClick}>
      {Array.from(brickGroups.entries()).map(([key, group]) => (
        <InstancedBrickGroup
          key={key}
          group={group}
          geometry={geometries.get(group.type)}
          selectedBrickId={selectedBrickId}
          ref={(ref) => instancedMeshRefs.current.set(key, ref)}
        />
      ))}
    </group>
  );
};

// Brick placement helper component
export const BrickPlacer = () => {
  const { selectedBrickType, selectedColor, buildMode, addBrick } =
    useBrickStore();

  const handlePlaneClick = (event) => {
    if (buildMode !== "place") return;

    const point = event.point;
    // Snap to grid
    const gridSize = LEGO_UNIT;
    const snappedX = Math.round(point.x / gridSize) * gridSize;
    const snappedZ = Math.round(point.z / gridSize) * gridSize;
    const snappedY = point.y + BRICK_HEIGHT / 2; // Place on surface

    const newBrick = createPhysicsBrick({
      type: selectedBrickType,
      position: [snappedX, snappedY, snappedZ],
      rotation: [0, 0, 0],
      color: selectedColor,
    });

    addBrick(newBrick);
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      onClick={handlePlaneClick}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshLambertMaterial color="#2d2d2d" />
    </mesh>
  );
};
