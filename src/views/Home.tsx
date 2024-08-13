import React from 'react';
import { Canvas } from '@react-three/fiber';


import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';


function Model() {
  const gltf = useLoader(GLTFLoader, 'brain2.glb'); // Replace with your GLB file path

  return <primitive object={gltf.scene} />;
}

function Home() {
  return (
    <div id="canvas-container">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Model />
        <OrbitControls enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2} // Limit vertical rotation
          minDistance={2} // Minimum zoom distance
          maxDistance={10} />
      </Canvas>
    </div>
  );
}

export default Home;
