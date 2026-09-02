---
name: threejs-scene
description: Create a React Three Fiber 3D WebGL scene. Use when building 3D backgrounds, rotating objects, particle effects, or any WebGL visual.
---

# React Three Fiber Scene (Antigravity)

## Base Pattern

```tsx
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import type { Mesh } from 'three';

const RotatingSphere = () => {
  const ref = useRef<Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.005; });
  return (
    <Float speed={1.5}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.1} />
      </mesh>
    </Float>
  );
};

export const HeroCanvas = () => (
  <div className="absolute inset-0 -z-10" aria-hidden="true">
    <Canvas camera={{ position: [0, 0, 4] }} dpr={[1, 2]} frameloop="demand">
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <RotatingSphere />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  </div>
);
```

## Performance Rules

- `frameloop="demand"` for non-interactive scenes
- `dpr={[1, 2]}` to cap pixel density
- Always wrap in `<Suspense fallback={null}>`
- Use `React.lazy()` on the Canvas component
- Store in `src/components/three/`
