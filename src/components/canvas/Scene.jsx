import { useEffect, useRef, useState } from 'react'
import { Physics } from '@react-three/rapier'
import { Environment } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Ground from './Ground'
import Brick from './Brick'
import useBrickStore from '../../stores/brickStore'

function Scene() {

    const bricks = useBrickStore((state) => state.bricks)
    const placingBrick = useBrickStore((state) => state.placingBrick)
    const confirmPlacement = useBrickStore((state) => state.confirmPlacement)

    // Refs for tracking position and intersection
    const pointerRef = useRef({ x: 0, y: 0, z: 0 })
    const raycasterRef = useRef(new THREE.Raycaster())
    const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
    const mouseRef = useRef(new THREE.Vector2())
    const previewRef = useRef()

    const { camera, scene } = useThree()

    useEffect(() => {
        const handlePointerMove = (event) => {
            if (!placingBrick) return

            // Update mouse coordinates
            const canvas = event.target
            mouseRef.current.x = (event.offsetX / canvas.clientWidth) * 2 - 1
            mouseRef.current.y = -(event.offsetY / canvas.clientHeight) * 2 + 1

            // Cast ray down from mouse position
            raycasterRef.current.setFromCamera(mouseRef.current, camera)

            // First, check for brick intersections
            const intersects = raycasterRef.current.intersectObjects(
                scene.children.filter(child =>
                    child.type === 'Mesh' &&
                    !child.isPreview
                ),
                true
            )

            // Find ground plane intersection
            const intersectPoint = new THREE.Vector3()
            raycasterRef.current.ray.intersectPlane(planeRef.current, intersectPoint)

            // Update position
            pointerRef.current.x = Math.round(intersectPoint.x)
            pointerRef.current.z = Math.round(intersectPoint.z)

            // Set height based on intersections
            if (intersects.length > 0 && intersects[0].face.normal.y > 0.5) {
                // If we hit the top face of a brick, place on top
                pointerRef.current.y = intersects[0].point.y
            } else {
                // Otherwise place at ground level
                pointerRef.current.y = 0
            }

            // Force update of preview brick
            if (previewRef.current) {
                previewRef.current.position.set(
                    pointerRef.current.x,
                    pointerRef.current.y,
                    pointerRef.current.z
                )
            }
        }

        const handleClick = () => {
            if (!placingBrick) return

            confirmPlacement([
                pointerRef.current.x,
                pointerRef.current.y,
                pointerRef.current.z
            ])
        }

        const canvas = document.querySelector('canvas')
        if (canvas) {
            canvas.addEventListener('pointermove', handlePointerMove)
            canvas.addEventListener('click', handleClick)
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('pointermove', handlePointerMove)
                canvas.removeEventListener('click', handleClick)
            }
        }
    }, [camera, scene, placingBrick, confirmPlacement])

    const [previewPosition, setPreviewPosition] = useState([0, 0, 0])
    const [placedBricks, setPlacedBricks] = useState([])

    const handleBrickHover = ({ face, snapPoint, dimensions }) => {
        // Update preview brick position based on snap point
        setPreviewPosition([snapPoint.x, snapPoint.y, snapPoint.z])
    }

    const handleBrickSnap = (position) => {
        // Check if position is valid (no intersections)
        const isValidPosition = !placedBricks.some(brick =>
            brick.checkIntersection(previewBrick)
        )

        if (isValidPosition) {
            // Update preview position
            setPreviewPosition(position)
        }
    }

    // Preview brick using actual Brick component without RigidBody
    const PreviewBrick = () => {
        if (!placingBrick) return null

        return (
            <group
                ref={previewRef}
                position={[pointerRef.current.x, pointerRef.current.y, pointerRef.current.z]}
            >
                <Brick
                    position={[0, 0, 0]}
                    color={placingBrick.color}
                    width={placingBrick.width}
                    length={placingBrick.length}
                    isPreview={true}
                />
            </group>
        )
    }



    return (
        <>
            <Environment preset="city" />

            <Physics>
                <Ground />
                {bricks.map((brick) => (
                    <Brick
                        key={brick.id}
                        position={brick.position}
                        color={brick.color}
                        width={brick.width}
                        length={brick.length}
                    />
                ))}
            </Physics>
            <PreviewBrick />
            <gridHelper args={[20, 20]} position={[0, -0.49, 0]} />
        </>
    )
}

export default Scene