# Portfolio Project — Agent Instructions

This is a personal portfolio website built with **React 18 + TypeScript + Vite**.

---

## Tech Stack

- **Package Manager:** Bun (use `bun` for ALL installs and scripts — never npm)
- **Framework:** React 18 (Vite)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Vanilla CSS
- **Animations:** GSAP (`@gsap/react`) + React Three Fiber (ThreeJS)

---

## Code Style

- Write fully type-safe TypeScript. Strict mode is on.
- Use functional React components with named exports.
- Props interfaces go at the top of each component file.
- Use Tailwind for layout and utility; vanilla CSS for complex animations.
- Snake_case for database columns; PascalCase for React components; camelCase for everything else.

---

## UI/UX Standards

- Premium, modern aesthetic — dark mode, vibrant accents, smooth gradients.
- Every animation must be purposeful. Use GSAP for complex timelines.
- 3D scenes via `@react-three/fiber` and `@react-three/drei`.
- Glassmorphism sparingly, where contextually appropriate.

---

## SEO & Performance

- One `<h1>` per page, logical heading hierarchy.
- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<section>`).
- Proper ARIA labels and alt text on all media.
- Lazy load heavy assets (3D, large images) with `React.lazy` / `Suspense`.
- Every page needs `<title>` and `<meta name="description">`.

---

## Architecture

- Follow the repository pattern.
- Keep business logic out of components.
- Components are in `src/components/`, pages in `src/pages/`.
- Use CSS custom properties for design tokens.

---

## Git Workflow

After every significant change, ask: *"Would you like me to commit and push to GitHub?"*

Commit messages follow Conventional Commits:
- `feat:`, `fix:`, `refactor:`, `style:`, `perf:`, `docs:`, `chore:`

Example: `feat: add GSAP scroll animation to hero section`

---

## What NOT to Do

- Do not use npm or yarn — **Bun only**.
- No placeholder code — always implement the full, working solution.
- Do not copy entire style guides into rules — use a linter instead.
- Do not duplicate what's already in the codebase — reference canonical examples.
