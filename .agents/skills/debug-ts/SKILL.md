---
name: debug-ts
description: Debug TypeScript errors, type mismatches, and React component issues. Use when there are type errors, broken builds, or runtime issues.
---

# Debug TypeScript & React (Antigravity)

## When to Use

- TypeScript compile errors (`tsc --noEmit`)
- Type mismatch between component props and usage
- React hook errors (stale closures, missing deps)
- GSAP type errors (missing `@types`)
- Three.js/R3F type errors

## Debugging Steps

### 1. Run TypeScript check
```bash
bunx tsc --noEmit
```

### 2. Common Issues & Fixes

**Props type mismatch**
```tsx
// Wrong — passing string where number expected
<MyComp size="large" />

// Fix — use proper union type in interface
interface Props { size: 'small' | 'large' | number }
```

**Ref typing**
```tsx
// Wrong
const ref = useRef(null);

// Correct
const ref = useRef<HTMLDivElement>(null);
const meshRef = useRef<Mesh>(null); // for R3F
```

**GSAP ScrollTrigger not registering**
```tsx
// Must be at module level, not inside component
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

**useEffect stale closure**
```tsx
// Add all used values to dependency array
useEffect(() => {
  doSomething(value);
}, [value]); // value must be listed
```

### 3. After fix, verify
```bash
bunx tsc --noEmit  # must pass with 0 errors
bun run build      # verify production build
```
