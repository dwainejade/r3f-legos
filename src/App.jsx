import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import Scene from './components/canvas/Scene'
import Toolbar from './components/ui/Toolbar';
import Controls from './components/ui/Controls';



function App() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <Toolbar />
      <Canvas
        shadows
        camera={{
          position: [10, 10, 10],
          fov: 50,
          near: .01,
          far: 10000
        }}
        gl={{ logarithmicDepthBuffer: true }}
      >
        <Scene />
        <OrbitControls />
      </Canvas>

      <Stats />
      <Controls />
    </div>
  );
}

export default App;