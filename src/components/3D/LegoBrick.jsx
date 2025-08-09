import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import useBrickStore from "store/useBrickStore";

// LEGO brick dimensions (in LEGO units where 1 unit = 8mm)
export const LEGO_UNIT = 0.8; // Scale factor for Three.js (8mm = 0.8 units)
export const STUD_HEIGHT = 0.17;
export const STUD_RADIUS = 0.24;
export const BRICK_HEIGHT = 0.96; // Standard brick height
export const WALL_THICKNESS = 0.15;

// worldPosition: THREE.Vector3 (or {x,y,z})
// brickType: key from BRICK_TYPES
// baseplateSize: number (in studs, same as your Baseplate `size`)
// baseplateHeight: world units (optional)
// rotationY: radians (optional, default 0)
export const snapToGrid = (
  worldPosition,
  brickType,
  baseplateSize,
  baseplateHeight = 0.32,
  rotationY = 0
) => {
  const dims = BRICK_TYPES[brickType];
  if (!dims) return { position: [0, 0, 0], isValid: false };

  const gridSize = LEGO_UNIT;

  // --- compute the stud-origin used by your Baseplate ---
  // Baseplate uses: start = (-(size - 1) * studSpacing) / 2
  // In stud units, that's:
  const studOrigin = -((baseplateSize - 1) / 2); // in studs

  // Convert world coords to stud units relative to the stud origin
  const xStudWorld = worldPosition.x / gridSize;
  const zStudWorld = worldPosition.z / gridSize;
  const xStudLocal = xStudWorld - studOrigin;
  const zStudLocal = zStudWorld - studOrigin;

  // Normalize rotation to nearest quarter-turn (0, 90, 180, 270)
  const quarterTurns =
    ((Math.round((rotationY % (2 * Math.PI)) / (Math.PI / 2)) % 4) + 4) % 4;

  // Swap width/depth parity if rotated by odd number of quarter turns
  let width = dims.width;
  let depth = dims.depth;
  if (quarterTurns % 2 === 1) {
    [width, depth] = [depth, width];
  }

  // Parity offset in stud-units: even -> 0.5, odd -> 0
  const xParityOffset = width % 2 === 0 ? 0.5 : 0;
  const zParityOffset = depth % 2 === 0 ? 0.5 : 0;

  // Snap in local stud space (relative to studOrigin), then convert back
  const snappedXStudLocal =
    Math.round(xStudLocal - xParityOffset) + xParityOffset;
  const snappedZStudLocal =
    Math.round(zStudLocal - zParityOffset) + zParityOffset;

  const snappedXStudWorld = snappedXStudLocal + studOrigin;
  const snappedZStudWorld = snappedZStudLocal + studOrigin;

  const snappedX = snappedXStudWorld * gridSize;
  const snappedZ = snappedZStudWorld * gridSize;

  // Y position: sit on top of baseplate
  const snappedY = baseplateHeight / 2 + BRICK_HEIGHT / 2;

  // Bounds check (world units)
  const brickHalfWidth = (width * gridSize) / 2;
  const brickHalfDepth = (depth * gridSize) / 2;
  const baseplateHalfSize = (baseplateSize * gridSize) / 2;

  const minX = snappedX - brickHalfWidth;
  const maxX = snappedX + brickHalfWidth;
  const minZ = snappedZ - brickHalfDepth;
  const maxZ = snappedZ + brickHalfDepth;

  const isValid =
    minX >= -baseplateHalfSize &&
    maxX <= baseplateHalfSize &&
    minZ >= -baseplateHalfSize &&
    maxZ <= baseplateHalfSize;

  return {
    position: [snappedX, snappedY, snappedZ],
    isValid,
  };
};
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
    const { instances, type } = group;

    const material = useMemo(
      () =>
        new THREE.MeshLambertMaterial({
          color: 0xffffff, // base white, instance colors will override
        }),
      []
    );

    const studGeometry = useMemo(
      () =>
        new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 12),
      []
    );

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

    // Create meshes ONCE
    useEffect(() => {
      if (!meshRef.current) return;

      // Initialize base colors and matrices so there's no black frame
      const mesh = meshRef.current;
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3(1, 1, 1);
      const tempColor = new THREE.Color();

      instances.forEach((brick, index) => {
        position.set(...brick.position);
        quaternion.setFromEuler(new THREE.Euler(...brick.rotation));
        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(index, matrix);

        tempColor.set(brick.color);
        if (selectedBrickId === brick.id) tempColor.multiplyScalar(1.3);

        mesh.setColorAt(index, tempColor);
      });

      mesh.count = instances.length;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    }, [instances, selectedBrickId]);

    // Same for studs
    useEffect(() => {
      if (!studMeshRef.current) return;

      const studMesh = studMeshRef.current;
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3(1, 1, 1);
      const tempColor = new THREE.Color();

      let studIndex = 0;
      instances.forEach((brick) => {
        const brickPos = new THREE.Vector3(...brick.position);
        const brickQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(...brick.rotation)
        );

        studPositionsPerBrick.forEach((studPos) => {
          const worldStudPos = new THREE.Vector3(...studPos);
          worldStudPos.applyQuaternion(brickQuat).add(brickPos);

          position.copy(worldStudPos);
          matrix.compose(position, brickQuat, scale);
          studMesh.setMatrixAt(studIndex, matrix);

          tempColor.set(brick.color);
          if (selectedBrickId === brick.id) tempColor.multiplyScalar(1.3);

          studMesh.setColorAt(studIndex, tempColor);
          studIndex++;
        });
      });

      studMesh.count = totalStuds;
      studMesh.instanceMatrix.needsUpdate = true;
      studMesh.instanceColor.needsUpdate = true;
    }, [instances, selectedBrickId, studPositionsPerBrick, totalStuds]);

    // Expose mesh ref for raycasting
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") ref(meshRef);
      else ref.current = meshRef;
    }, [ref]);

    if (!geometry) return null;

    return (
      <group>
        {/* Main brick bodies */}
        <instancedMesh
          ref={meshRef}
          args={[geometry, material, Math.max(instances.length, 1)]}
          castShadow
          receiveShadow
        >
          <instancedBufferAttribute
            attach="instanceColor"
            args={[
              Float32Array.from(
                instances.flatMap((b) => new THREE.Color(b.color).toArray())
              ),
              3,
            ]}
          />
        </instancedMesh>

        {/* Studs */}
        {totalStuds > 0 && (
          <instancedMesh
            ref={studMeshRef}
            args={[studGeometry, material, Math.max(totalStuds, 1)]}
            castShadow
          >
            <instancedBufferAttribute
              attach="instanceColor"
              args={[
                Float32Array.from(
                  instances.flatMap((b) =>
                    studPositionsPerBrick.flatMap(() =>
                      new THREE.Color(b.color).toArray()
                    )
                  )
                ),
                3,
              ]}
            />
          </instancedMesh>
        )}
      </group>
    );
  }
);

// Instanced LEGO Brick System - groups bricks by type ONLY (not by color)
export const InstancedLegoBricks = () => {
  const { bricks, selectedBrickId, selectBrick } = useBrickStore();
  const instancedMeshRefs = useRef(new Map());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Group bricks by type ONLY (not by color) to allow individual brick colors
  const brickGroups = useMemo(() => {
    const groups = new Map();

    bricks.forEach((brick) => {
      const key = brick.type; // Only group by type, not color
      if (!groups.has(key)) {
        groups.set(key, {
          type: brick.type,
          color: "#ffffff", // Base color, individual colors will be set via instance attributes
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
