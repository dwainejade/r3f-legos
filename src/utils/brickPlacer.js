import * as THREE from "three";
import { useCallback } from "react";
import useBrickStore, {
  BRICK_TYPES,
  LEGO_UNIT,
  BRICK_HEIGHT,
} from "store/useBrickStore";
import { snapPositionToGrid } from "./snapUtils";

export function useBrickPlacer(camera, scene, baseplateMesh, brickMeshes) {
  const addBrick = useBrickStore((state) => state.addBrick);
  const bricks = useBrickStore((state) => state.bricks);
  const selectedBrickType = useBrickStore((state) => state.selectedBrickType);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handleClick = useCallback(
    (event) => {
      // Calculate mouse NDC coords
      const rect = event.target.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Objects to test: all bricks + baseplate
      const objects = [...brickMeshes, baseplateMesh].filter(Boolean);

      const intersects = raycaster.intersectObjects(objects);
      if (intersects.length === 0) return;

      const hit = intersects[0];

      // Get face normal to determine placement direction
      const normal = hit.face.normal.clone();

      // Find the brick hit (if any)
      const hitMesh = hit.object;
      let existingBrick = null;
      for (const brick of bricks) {
        if (brick.mesh === hitMesh) {
          existingBrick = brick;
          break;
        }
      }

      // Calculate offset for placement based on normal and sizes
      const dimsNew = BRICK_TYPES[selectedBrickType];
      if (!dimsNew) return;

      // Offsets for placement
      let offset = new THREE.Vector3();
      if (Math.abs(normal.y) === 1) {
        // top/bottom face
        offset.set(
          0,
          normal.y * (BRICK_HEIGHT / 2 + BRICK_HEIGHT / 2), // existing + new brick half heights
          0
        );
      } else if (Math.abs(normal.x) === 1) {
        // side X face
        offset.set(
          normal.x * ((dimsNew.width * LEGO_UNIT) / 2 + LEGO_UNIT / 2),
          0,
          0
        );
      } else if (Math.abs(normal.z) === 1) {
        // side Z face
        offset.set(
          0,
          0,
          normal.z * ((dimsNew.depth * LEGO_UNIT) / 2 + LEGO_UNIT / 2)
        );
      }

      // Compute tentative position for new brick
      const tentativePos = hit.point.clone().add(offset);

      // Snap position to grid (only X,Z)
      const snappedPos = snapPositionToGrid(tentativePos, selectedBrickType);

      // Calculate Y position properly (stacked bricks)
      if (Math.abs(normal.y) === 1) {
        // Placing on top/bottom: align Y so brick rests on surface
        snappedPos.y = hit.point.y + normal.y * BRICK_HEIGHT; // place one brick height above/below hit surface
      } else {
        // Side placement: keep Y aligned with hit surface's brick center
        snappedPos.y = hit.point.y;
      }

      // Collision check (using store function)
      if (
        useBrickStore
          .getState()
          .canPlaceBrickAt(
            [snappedPos.x, snappedPos.y, snappedPos.z],
            selectedBrickType,
            bricks
          )
      ) {
        addBrick({
          type: selectedBrickType,
          color: useBrickStore.getState().selectedColor,
          position: [snappedPos.x, snappedPos.y, snappedPos.z],
          rotation: [0, 0, 0],
        });
      } else {
        console.log("Cannot place brick here due to collision");
      }
    },
    [camera, bricks, selectedBrickType, addBrick, baseplateMesh, brickMeshes]
  );

  return { handleClick };
}
