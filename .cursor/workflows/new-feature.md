---
description: "New feature workflow: plan → build component → add animation → SEO check → commit."
alwaysApply: false
---

# Workflow: New Feature Development

**Trigger:** When user asks to build a new section, feature, or visual element.

## Steps

### 1. Plan & Understand
- What is the component's purpose and visual goal?
- Does it need animation? (GSAP / R3F)
- Does it need to be a page or reusable component?
- What are the SEO requirements if it's a page?

### 2. Create the Component
- File in `src/components/` (reusable) or `src/pages/` (route)
- Props interface at the top
- Named export only
- Semantic HTML with ARIA labels

### 3. Add Styling
- Tailwind CSS for layout and composition
- CSS custom properties for design tokens
- Dark mode first

### 4. Add Animation (if needed)
- Use GSAP with `gsap.context()` + cleanup
- ScrollTrigger for scroll-based effects
- R3F for 3D elements

### 5. SEO Check (if page)
- Single `<h1>`, logical hierarchy
- `<title>` and `<meta description>` set
- Semantic HTML5 structure
- All images have `alt` text

### 6. Verify
```bash
bun run dev   # check visually
```

### 7. Commit
```bash
git add .
git commit -m "feat(<scope>): <description>"
git push
```
