---
name: threejs-scene
description: Create a React Three Fiber 3D WebGL scene. Use when the user wants a 3D object, background, interactive canvas, or any ThreeJS/WebGL visual.
---

# Three.js / React Three Fiber Scene

Build performant WebGL 3D scenes using `@react-three/fiber` and `@react-three/drei`.

## When to Use

- User wants a 3D background, hero element, or interactive 3D visual
- Building a rotating object, particle system, or abstract geometry
- Adding floating 3D icons or decorative WebGL elements

## Base Scene Setup

```tsx
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh } from 'three';

// Lazy-load the Canvas for performance
import React from 'react';
const ThreeScene = React.lazy(() => import('./ThreeScene'));

// Sub-component: rotating mesh
const AnimatedSphere = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

// Main Canvas wrapper
export const HeroCanvas = () => (
  <div className="absolute inset-0 -z-10" aria-hidden="true">
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      dpr={[1, 2]}                    // Limit pixel ratio for perf
      frameloop="demand"              // Only render when needed
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AnimatedSphere />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  </div>
);
```

## Performance Rules

- Use `frameloop="demand"` for static/slowly changing scenes
- Always set `dpr={[1, 2]}` to cap pixel density
- Wrap in `<Suspense>` — never render blocking
- Use `React.lazy()` on the Canvas component itself
- Dispose geometries/materials: use `useEffect` cleanup or `@react-three/drei`'s `useGLTF.preload`

## Common Drei Helpers

| Helper | Use Case |
|---|---|
| `<Float>` | Floating idle animation |
| `<OrbitControls>` | Mouse drag rotation |
| `<Environment>` | HDR lighting presets |
| `<MeshDistortMaterial>` | Organic distortion |
| `<Sparkles>` | Particle effects |
| `<Text3D>` | 3D typography |
| `<useGLTF>` | Load `.glb` / `.gltf` models |

## Location

Always export canvas as a named component in `src/components/three/`.
