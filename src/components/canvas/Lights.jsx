// src/components/canvas/Lights.jsx
import { Environment, useHelper } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function Lights({ debug = false }) {
    const mainLight = useRef()
    const fillLight = useRef()
    const rimLight = useRef()

    // Show helpers if debug mode is enabled
    useHelper(debug && mainLight, THREE.DirectionalLightHelper, 1, 'red')
    useHelper(debug && fillLight, THREE.DirectionalLightHelper, 1, 'blue')
    useHelper(debug && rimLight, THREE.DirectionalLightHelper, 1, 'green')

    return (
        <>
            {/* Ambient light for general illumination */}
            <ambientLight intensity={0.2} />

            {/* Main directional light - primary light source */}
            <directionalLight
                ref={mainLight}
                position={[10, 10, 5]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.0001}
            />

            {/* Fill light - softens shadows */}
            <directionalLight
                ref={fillLight}
                position={[-5, 5, -5]}
                intensity={0.7}
                color="#b1e1ff"
            />

            {/* Rim light - creates highlights on edges */}
            {/* <directionalLight
                ref={rimLight}
                position={[5, 5, -5]}
                intensity={0.5}
                color="#ffd1b1"
            /> */}

            {/* Hemisphere light - adds subtle color variation */}
            {/* <hemisphereLight
                color="#b1e1ff"
                groundColor="#ff8a65"
                intensity={0.4}
            /> */}
        </>
    )
}

export default Lights