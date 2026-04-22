---
description: "SEO best practices, semantic HTML5, accessibility, Core Web Vitals optimization."
globs: ["src/**/*.tsx", "*.html", "index.html"]
alwaysApply: false
---

# SEO, Accessibility & Performance (Antigravity)

## SEO Requirements (Every Page)

- **Unique `<title>`** and **`<meta name="description">`** per page.
- **Single `<h1>`** — strictly one per page.
- **Logical heading hierarchy:** h1 → h2 → h3, no skipping levels.
- Open Graph meta tags for social sharing:
  ```html
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="..." />
  <meta property="og:type" content="website" />
  ```

## Semantic HTML5

Always use proper structural elements:
- `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
- `<button>` for interactive elements (not `<div onClick>`)
- `<a>` for navigation links with meaningful `href`

## Accessibility

- **ARIA labels** on all icon buttons and non-obvious interactive elements.
- **Alt text** on every `<img>` — descriptive, not "image of..."
- **Keyboard navigation** — all interactive elements must be focusable and operable via keyboard.
- **Color contrast** — WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).

## Core Web Vitals

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |

### Optimization Techniques
- Lazy load below-the-fold images: `loading="lazy"`.
- Lazy load heavy components: `React.lazy(() => import('./HeavyComponent'))`.
- `loading="eager"` + `fetchpriority="high"` on LCP image only.
- Avoid layout shifts — always specify `width` and `height` on images.
- Minimize JavaScript bundle — split code per route.
