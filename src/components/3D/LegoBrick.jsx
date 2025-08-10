import { useRef, useMemo, useEffect, forwardRef } from "react";
import * as THREE from "three";
import useBrickStore, {
  LEGO_UNIT,
  STUD_HEIGHT,
  STUD_RADIUS,
  BRICK_HEIGHT,
  BRICK_TYPES,
} from "store/useBrickStore";

// LEGO brick dimensions (in LEGO units where 1 unit = 8mm)
export const WALL_THICKNESS = 0.15;

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
const InstancedBrickGroup = forwardRef(
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
  const bricks = useBrickStore((state) => state.bricks);
  const selectedBrickId = useBrickStore((state) => state.selectedBrickId);
  const instancedMeshRefs = useRef(new Map());

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

  return (
    <group>
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
