---
name: new-page-seo
description: Create a new page with all required SEO, accessibility, and semantic HTML standards. Use when creating a new route/page component.
---

# New Page with SEO

Create a fully SEO-optimized page component with all required metadata and structure.

## When to Use

- Creating a new route or page
- Any time a `<Page>` or top-level layout component is needed

## Template

```tsx
// src/pages/AboutPage.tsx

export const AboutPage = () => {
  return (
    <>
      {/* SEO Meta — update with react-helmet or Vite plugin */}
      {/* <title>About — Demis Portfolio</title> */}
      {/* <meta name="description" content="..." /> */}

      <main id="main-content">
        {/* Skip link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 z-50">
          Skip to content
        </a>

        {/* ONE h1 per page — describes the page */}
        <h1 className="text-5xl font-bold">About Me</h1>

        {/* Logical heading hierarchy */}
        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading">Skills & Technologies</h2>

          <article>
            <h3>Frontend Development</h3>
            <p>React 18, TypeScript, Tailwind CSS...</p>
          </article>
        </section>

        <section aria-labelledby="experience-heading">
          <h2 id="experience-heading">Experience</h2>
        </section>
      </main>
    </>
  );
};
```

## SEO Checklist

- [ ] Unique `<title>` — format: `{PageName} — Demis Portfolio`
- [ ] `<meta name="description">` — 120–160 chars, unique per page
- [ ] Single `<h1>` — describes what this page is
- [ ] Logical heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] Semantic HTML5 (`<main>`, `<section>`, `<article>`, `<nav>`)
- [ ] `aria-labelledby` on sections with headings
- [ ] All images have descriptive `alt` text
- [ ] All icon buttons have `aria-label`
- [ ] Open Graph tags (og:title, og:description, og:image)
