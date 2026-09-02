---
name: create-component
description: Create a new React TypeScript component following portfolio architecture conventions. Use when asked to build a new UI component, section, or card.
---

# Create React Component (Antigravity)

## Component Template

```tsx
interface MyComponentProps {
  title: string;
  className?: string;
}

export const MyComponent = ({ title, className }: MyComponentProps) => {
  return (
    <section className={className} aria-label={title}>
      <h2>{title}</h2>
    </section>
  );
};
```

## Rules

- Props interface at TOP of file always
- Named export ONLY (no default exports)
- Use semantic HTML (`<section>`, `<article>`, `<nav>`)
- GSAP: always use `gsap.context()` + `ctx.revert()` cleanup
- Location: `src/components/` or `src/pages/`
