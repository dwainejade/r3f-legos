import { LEGO_UNIT, BRICK_HEIGHT, BRICK_TYPES } from "store/useBrickStore";

export function snapPositionToGrid(pos, brickType) {
  const dims = BRICK_TYPES[brickType];
  if (!dims) return pos;

  // Baseplate stud origin (centered)
  const studOrigin = -((32 - 1) / 2);

  // Convert to stud space
  const xStud = pos.x / LEGO_UNIT;
  const zStud = pos.z / LEGO_UNIT;

  // Calculate parity offset
  const xParityOffset = dims.width % 2 === 0 ? 0.5 : 0;
  const zParityOffset = dims.depth % 2 === 0 ? 0.5 : 0;

  // Snap
  const snappedXStud = Math.round(xStud - xParityOffset) + xParityOffset;
  const snappedZStud = Math.round(zStud - zParityOffset) + zParityOffset;

  // Convert back to world coordinates
  const snappedX = snappedXStud * LEGO_UNIT;
  const snappedZ = snappedZStud * LEGO_UNIT;

  // Y is not snapped here; it’s calculated by stacking logic
  return new THREE.Vector3(snappedX, pos.y, snappedZ);
}
