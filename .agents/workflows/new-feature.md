# Workflow: New Feature Development

**Trigger:** User asks to build a new section, page, component, or visual element.

## Steps

### 1. Understand
- What is the visual goal?
- Does it need animation (GSAP) or 3D (R3F)?
- Is this a page (needs SEO) or a reusable component?

### 2. Build Component
- Props interface at top of file
- Named export only
- Semantic HTML + ARIA labels
- Location: `src/components/` or `src/pages/`

### 3. Style It
- Tailwind CSS for layout + utilities
- CSS custom properties for design tokens
- Dark mode first
- Micro-animations on interactive elements

### 4. Add Animation (if needed)
- GSAP: `gsap.context()` + `ctx.revert()` cleanup
- R3F: `frameloop="demand"` + `<Suspense>`
- ScrollTrigger: scoped to container ref

### 5. SEO Check (if it's a page)
- Single `<h1>`
- Logical heading hierarchy
- Semantic HTML5 structure
- `aria-labelledby` on sections
- Meta tags set

### 6. Verify
```bash
bun run dev
bunx tsc --noEmit
```

### 7. Commit
```bash
git add .
git commit -m "feat(<scope>): <description>"
git push
```
