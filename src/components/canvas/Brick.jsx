import { RigidBody } from '@react-three/rapier'
import { useRef, useMemo, useEffect, useState } from 'react'
import { Object3D, CylinderGeometry, BoxGeometry, MeshStandardMaterial, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'

// PreviewBrick component with snapping behavior
function PreviewBrick({ position, color, width, length, onPositionUpdate }) {
    const instancedMeshRef = useRef()
    const [snappedPosition, setSnappedPosition] = useState(position)

    // LEGO Unit System (in mm)
    const SCALE = 0.1
    const PLATE = useMemo(() => ({
        STUD_SPACING: 8 * SCALE,
        STUD_DIAMETER: 4.8 * SCALE,
        STUD_HEIGHT: 1.8 * SCALE,
        HEIGHT: 9.6 * SCALE,
    }), [])

    const dimensions = useMemo(() => ({
        width: width * PLATE.STUD_SPACING,
        length: length * PLATE.STUD_SPACING,
        height: PLATE.HEIGHT
    }), [width, length, PLATE])

    const previewMaterial = useMemo(() => new MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.5,
    }), [color])

    const studGeometry = useMemo(() => new CylinderGeometry(
        PLATE.STUD_DIAMETER / 2,
        PLATE.STUD_DIAMETER / 2,
        PLATE.STUD_HEIGHT,
        8
    ), [PLATE])

    const brickGeometry = useMemo(() => new BoxGeometry(
        dimensions.width,
        dimensions.height,
        dimensions.length
    ), [dimensions])

    useEffect(() => {
        setSnappedPosition(position)
        if (onPositionUpdate) {
            onPositionUpdate(position)
        }
        console.log(snappedPosition)
    }, [position, onPositionUpdate])

    return (
        <group position={snappedPosition}>
            <mesh geometry={brickGeometry} material={previewMaterial} />
            <instancedMesh
                ref={instancedMeshRef}
                args={[studGeometry, previewMaterial, width * length]}
            />
        </group>
    )
}

// Main Brick component with interaction detection
function Brick({
    position,
    color = "#cc0000",
    width = 2,
    length = 4,
    isPreview = false,
    onHover,
    onSnap
}) {
    if (isPreview) {
        return (
            <PreviewBrick
                position={position}
                color={color}
                width={width}
                length={length}
                onPositionUpdate={onSnap}
            />
        )
    }

    const brickRef = useRef()
    const meshRef = useRef()
    const instancedMeshRef = useRef()

    // LEGO Unit System (in mm)
    const SCALE = 0.1
    const PLATE = useMemo(() => ({
        STUD_SPACING: 8 * SCALE,
        STUD_DIAMETER: 4.8 * SCALE,
        STUD_HEIGHT: 1.8 * SCALE,
        HEIGHT: 9.6 * SCALE,
    }), [])

    const dimensions = useMemo(() => ({
        width: width * PLATE.STUD_SPACING,
        length: length * PLATE.STUD_SPACING,
        height: PLATE.HEIGHT
    }), [width, length, PLATE])

    const material = useMemo(() => new MeshStandardMaterial({ color }), [color])

    const studGeometry = useMemo(() => new CylinderGeometry(
        PLATE.STUD_DIAMETER / 2,
        PLATE.STUD_DIAMETER / 2,
        PLATE.STUD_HEIGHT,
        8
    ), [PLATE])

    const brickGeometry = useMemo(() => new BoxGeometry(
        dimensions.width,
        dimensions.height,
        dimensions.length
    ), [dimensions])

    // Calculate snap points for each face
    const getSnapPoints = (face, point) => {
        const worldPosition = new Vector3()
        meshRef.current.getWorldPosition(worldPosition)

        switch (face) {
            case 'Top':
                return new Vector3(
                    worldPosition.x,
                    worldPosition.y + dimensions.height,
                    worldPosition.z
                )
            case 'Bottom':
                return new Vector3(
                    worldPosition.x,
                    worldPosition.y - dimensions.height,
                    worldPosition.z
                )
            case 'Left':
                return new Vector3(
                    worldPosition.x - dimensions.width,
                    worldPosition.y,
                    worldPosition.z
                )
            case 'Right':
                return new Vector3(
                    worldPosition.x + dimensions.width,
                    worldPosition.y,
                    worldPosition.z
                )
            case 'Front':
                return new Vector3(
                    worldPosition.x,
                    worldPosition.y,
                    worldPosition.z + dimensions.length
                )
            case 'Back':
                return new Vector3(
                    worldPosition.x,
                    worldPosition.y,
                    worldPosition.z - dimensions.length
                )
            default:
                return worldPosition
        }
    }

    // Handle pointer move to detect sides and trigger snapping
    const onPointerMove = (event) => {
        if (!meshRef.current) return

        // Get normal from the intersection
        const normal = event.face.normal.clone()

        // Transform the normal to world space
        normal.transformDirection(meshRef.current.matrixWorld)

        // Round the normal components to handle floating point imprecision
        const nx = Math.round(normal.x * 100) / 100
        const ny = Math.round(normal.y * 100) / 100
        const nz = Math.round(normal.z * 100) / 100

        // Determine face based on the normal vector
        let face = ''
        if (Math.abs(ny) > 0.9) {
            face = ny > 0 ? 'Top' : 'Bottom'
        } else if (Math.abs(nx) > 0.9) {
            face = nx > 0 ? 'Right' : 'Left'
        } else if (Math.abs(nz) > 0.9) {
            face = nz > 0 ? 'Front' : 'Back'
        }

        if (face && onHover) {
            const snapPoint = getSnapPoints(face, event.point)
            onHover({ face, snapPoint, dimensions })
        }
    }

    // Detect intersections with other bricks
    const checkIntersection = (otherBrick) => {
        if (!meshRef.current || !otherBrick.meshRef.current) return false

        const box1 = meshRef.current.geometry.boundingBox.clone()
        box1.applyMatrix4(meshRef.current.matrixWorld)

        const box2 = otherBrick.meshRef.current.geometry.boundingBox.clone()
        box2.applyMatrix4(otherBrick.meshRef.current.matrixWorld)

        return box1.intersectsBox(box2)
    }

    useEffect(() => {
        if (instancedMeshRef.current) {
            const dummy = new Object3D()
            for (let row = 0; row < length; row++) {
                for (let col = 0; col < width; col++) {
                    dummy.position.set(
                        -dimensions.width / 2 + PLATE.STUD_SPACING / 2 + col * PLATE.STUD_SPACING,
                        dimensions.height / 2 + PLATE.STUD_HEIGHT / 2,
                        -dimensions.length / 2 + PLATE.STUD_SPACING / 2 + row * PLATE.STUD_SPACING
                    )
                    dummy.updateMatrix()
                    instancedMeshRef.current.setMatrixAt(row * width + col, dummy.matrix)
                }
            }
            instancedMeshRef.current.instanceMatrix.needsUpdate = true
        }
    }, [width, length, dimensions, PLATE])

    return (
        <RigidBody position={position} colliders="cuboid" ref={brickRef}>
            <group>
                <mesh
                    ref={meshRef}
                    geometry={brickGeometry}
                    material={material}
                    onPointerMove={onPointerMove}
                />
                <instancedMesh
                    ref={instancedMeshRef}
                    args={[studGeometry, material, width * length]}
                />
            </group>
        </RigidBody>
    )
}

export default Brick