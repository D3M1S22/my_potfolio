---
name: gsap-animation
description: Add GSAP animations to a React component — scroll-triggered, timeline sequences, hover effects. Use when the user wants to animate something with GSAP or ScrollTrigger.
---

# GSAP Animation Skill

Implement GSAP animations in React components the correct, performant way.

## When to Use

- User wants to animate an element into view on scroll
- Building a complex timeline sequence
- Hover/micro-interaction animations
- Staggered entrance animations

## Core Pattern — GSAP in React

Always use `gsap.context()` for proper cleanup:

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AnimatedSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.animate-in',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef); // scope to container

    return () => ctx.revert(); // ALWAYS clean up
  }, []);

  return (
    <div ref={containerRef}>
      <h2 className="animate-in">Title</h2>
      <p className="animate-in">Paragraph</p>
    </div>
  );
};
```

## Common Animation Patterns

### Fade + Slide Up (entrance)
```js
gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
```

### Staggered Children
```js
gsap.from('.card', { opacity: 0, y: 30, stagger: 0.1, duration: 0.6 });
```

### Parallax Scroll
```js
gsap.to('.parallax-bg', {
  yPercent: -30,
  ease: 'none',
  scrollTrigger: { trigger: '.section', scrub: true },
});
```

### Timeline Sequence
```js
const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', pin: true, scrub: 1 } });
tl.from('.headline', { opacity: 0, y: 100 })
  .from('.subline', { opacity: 0, x: -50 }, '-=0.3')
  .from('.cta', { opacity: 0, scale: 0.8 }, '-=0.2');
```

## Rules

- Always register plugins at module level: `gsap.registerPlugin(ScrollTrigger)`
- Always use `gsap.context()` and return `ctx.revert()` in cleanup
- Prefer `power2.out` / `power3.out` eases for natural feel
- Use `scrub: true` for scroll-linked animations
- Avoid `will-change: transform` on too many elements simultaneously
