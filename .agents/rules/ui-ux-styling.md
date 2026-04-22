---
description: "UI/UX, styling, GSAP animations, ThreeJS 3D — applied when editing components or styles."
globs: ["src/**/*.tsx", "src/**/*.css", "src/**/*.ts"]
alwaysApply: false
---

# UI/UX & Styling Excellence (Antigravity)

## Design Philosophy

Premium, modern aesthetic that wows at first glance. Never create a minimum viable product — always create a state-of-the-art design.

## Color & Visual Design

- **Dark mode first** — deep backgrounds, vibrant accent colors.
- **Color palettes:** Use curated HSL colors, never plain red/blue/green.
- **Gradients:** Smooth, purposeful, not garish.
- **Glassmorphism:** Use sparingly — backdrop-blur + semi-transparent backgrounds where contextually appropriate.
- **Typography:** Google Fonts preferred (Inter, Outfit, Roboto Mono for code).

## Component Styling

- **Tailwind CSS** for layout and utility composition.
- **Vanilla CSS** for complex animations, custom properties, and hyper-specific styles.
- **CSS Custom Properties:** Define all design tokens as variables:
  ```css
  --color-primary: hsl(220, 90%, 60%);
  --color-surface: hsl(220, 20%, 10%);
  --spacing-section: 6rem;
  ```

## Animations

### GSAP (Primary — Complex Animations)
- Use for scroll-triggered sequences, timeline orchestration, SVG morphing.
- Always register ScrollTrigger plugin.
- Clean up with `gsap.context()` in `useEffect` cleanup.

### React Three Fiber (3D Graphics)
- Use `@react-three/fiber` for WebGL scenes.
- Prefer `@react-three/drei` helpers: `OrbitControls`, `Environment`, `Float`.
- Optimize with `frameloop="demand"` when scene is static.

## Micro-Interactions

Every interactive element should have:
- Hover state (scale or color transition)
- Active/press state
- Focus indicator for accessibility
- Transition duration: 150–300ms, `ease-out`
