import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { useState } from "react";

const STUD_HEIGHT = 0.1;
const STUD_RADIUS = 0.24;
const UNIT = 1;

// --- Lego Brick Primitive ---
function LegoBrick({
  width = 2,
  depth = 4,
  height = 1,
  color = "red",
  position = [0, 0, 0],
}) {
  const studs = [];
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      studs.push(
        <mesh
          key={`stud-${x}-${z}`}
          position={[
            position[0] + (x - (width - 1) / 2) * UNIT,
            position[1] + height / 2 + STUD_HEIGHT / 2,
            position[2] + (z - (depth - 1) / 2) * UNIT,
          ]}
        >
          <cylinderGeometry
            args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 32]}
          />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
  }

  return (
    <group>
      <mesh position={position}>
        <boxGeometry args={[width * UNIT, height, depth * UNIT]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {studs}
    </group>
  );
}

// --- Main Scene ---
export default function App() {
  const [bricks, setBricks] = useState([
    { width: 2, depth: 4, height: 1, color: "red", position: [0, 0.5, 0] },
  ]);

  const addBrickOnTop = () => {
    const lastBrick = bricks[bricks.length - 1];
    const randomWidth = Math.floor(Math.random() * 4) + 1; // 1–4 studs
    const randomDepth = Math.floor(Math.random() * 4) + 1; // 1–4 studs
    const randomColor = new THREE.Color(
      Math.random(),
      Math.random(),
      Math.random()
    ).getStyle();

    const newBrick = {
      width: randomWidth,
      depth: randomDepth,
      height: 1,
      color: randomColor,
      position: [
        lastBrick.position[0],
        lastBrick.position[1] + lastBrick.height, // stack above
        lastBrick.position[2],
      ],
    };

    setBricks([...bricks, newBrick]);
  };

  return (
    <div className="scene">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} onClick={addBrickOnTop}>
        <Stats />
        <gridHelper args={[20, 20]} />
        <OrbitControls />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} />

        {bricks.map((b, i) => (
          <LegoBrick key={i} {...b} />
        ))}
      </Canvas>
    </div>
  );
}
