---
name: create-component
description: Create a new React TypeScript component following the portfolio's architecture conventions. Use when asked to build a new UI component, section, or card.
---

# Create React Component

Create a new, production-ready React TypeScript component following the portfolio's standards.

## When to Use

- User asks to build a new component, section, card, or UI element
- Starting a new page section (Hero, About, Projects, Contact)
- Building reusable UI primitives

## Component Structure

Every component must follow this exact layout:

```tsx
// 1. Imports (React, libraries, then local)
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

// 2. Props interface (always at the top)
interface MyComponentProps {
  title: string;
  description?: string;
  className?: string;
}

// 3. Named export (never default export)
export const MyComponent = ({ title, description, className }: MyComponentProps) => {
  const ref = useRef<HTMLElement>(null);

  // 4. GSAP cleanup pattern
  useEffect(() => {
    const ctx = gsap.context(() => {
      // animations here
    }, ref);
    return () => ctx.revert(); // cleanup
  }, []);

  // 5. Semantic HTML with Tailwind + accessibility
  return (
    <section ref={ref} className={`relative ${className ?? ''}`} aria-label={title}>
      <h2 className="text-3xl font-bold">{title}</h2>
      {description && <p className="text-muted mt-4">{description}</p>}
    </section>
  );
};
```

## Naming Conventions

- File: `PascalCase.tsx` → `HeroSection.tsx`
- Component: PascalCase → `HeroSection`
- Props interface: `ComponentNameProps`
- CSS classes: Tailwind utilities + custom CSS variables

## Location

- **Components:** `src/components/`
- **Pages:** `src/pages/`
- **Shared/reusable:** `src/components/ui/`

## Checklist

- [ ] Props interface at top of file
- [ ] Named export only
- [ ] Semantic HTML element used (not `<div>` everywhere)
- [ ] ARIA label where needed
- [ ] GSAP context + cleanup if animation used
- [ ] Tailwind for layout, CSS vars for tokens
