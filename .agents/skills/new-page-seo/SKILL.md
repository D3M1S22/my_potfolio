---
name: new-page-seo
description: Create a new page with all SEO, accessibility, and semantic HTML requirements. Use when building a new route or page component.
---

# New Page SEO (Antigravity)

## Checklist (must complete all)

- [ ] Unique `<title>` — format: `{Page} — Demis Portfolio`
- [ ] `<meta name="description">` — 120–160 chars
- [ ] Single `<h1>` per page — describes page purpose
- [ ] Logical heading hierarchy: h1 → h2 → h3
- [ ] Semantic: `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`
- [ ] `aria-labelledby` on sections
- [ ] All `<img>` have `alt` text
- [ ] All icon buttons have `aria-label`

## Minimal Template

```tsx
export const AboutPage = () => (
  <main id="main-content">
    <h1>About Me</h1>
    <section aria-labelledby="skills-h2">
      <h2 id="skills-h2">Skills</h2>
    </section>
  </main>
);
```
