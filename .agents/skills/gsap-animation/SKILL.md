---
name: gsap-animation
description: Add GSAP animations with ScrollTrigger to React components. Use when animating elements, building timelines, or scroll-triggered effects.
---

# GSAP Animation (Antigravity)

## Core Pattern

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AnimatedSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.animate-in',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
        }
      );
    }, containerRef);
    return () => ctx.revert(); // CRITICAL: always clean up
  }, []);

  return <div ref={containerRef}><h2 className="animate-in">Title</h2></div>;
};
```

## Rules

- Register plugins at module level
- Always `gsap.context()` scoped to container ref
- Always `return () => ctx.revert()` for cleanup
- Prefer `power2.out` / `power3.out` eases
