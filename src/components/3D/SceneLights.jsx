// Main lighting setup for the LEGO scene
const SceneLights = () => {
  return (
    <>
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.4} color="#ffffff" />

      {/* Main directional light (sun) with shadows */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Fill light from the opposite side */}
      <directionalLight
        position={[-5, 8, -3]}
        intensity={0.3}
        color="#b3d9ff" // Slightly blue for contrast
      />

      {/* Key light for detail enhancement */}
      <pointLight
        position={[-10, 5, -5]}
        intensity={0.3}
        color="#ffeecc" // Warm light
        decay={2}
        distance={20}
      />

      {/* Subtle rim light for depth */}
      <pointLight
        position={[5, 2, 8]}
        intensity={0.2}
        color="#ffffff"
        decay={2}
        distance={15}
      />

      {/* Bottom fill light to reduce harsh shadows */}
      <hemisphereLight
        skyColor="#87ceeb" // Sky blue
        groundColor="#654321" // Ground brown
        intensity={0.2}
      />
    </>
  );
};

// Alternative lighting setup for different moods
export const SceneLightsStudio = () => {
  return (
    <>
      {/* Studio-style lighting setup */}
      <ambientLight intensity={0.3} />

      {/* Three-point lighting setup */}
      {/* Key light */}
      <directionalLight
        position={[8, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Fill light */}
      <directionalLight position={[-6, 6, 2]} intensity={0.4} color="#b3d9ff" />

      {/* Back light */}
      <directionalLight position={[0, 4, -8]} intensity={0.6} color="#ffeecc" />
    </>
  );
};

// Dramatic lighting for presentations
export const SceneLightsDramatic = () => {
  return (
    <>
      <ambientLight intensity={0.1} />

      {/* Strong key light */}
      <spotLight
        position={[10, 15, 5]}
        intensity={2}
        angle={Math.PI / 4}
        penumbra={0.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Colored accent lights */}
      <pointLight
        position={[-8, 3, -8]}
        intensity={0.5}
        color="#ff6b35"
        decay={2}
        distance={20}
      />

      <pointLight
        position={[8, 3, 8]}
        intensity={0.5}
        color="#004e89"
        decay={2}
        distance={20}
      />
    </>
  );
};

export default SceneLights;
