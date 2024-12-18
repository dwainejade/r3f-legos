// src/components/canvas/Ground.jsx
import { RigidBody } from '@react-three/rapier'

function Ground() {
    return (
        <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, -1, 0]} receiveShadow>
                <boxGeometry args={[40, 1, 40]} />
                <meshStandardMaterial color="#7d4e36" />
            </mesh>
        </RigidBody>
    )
}

export default Ground