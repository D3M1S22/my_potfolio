# My Portfolio Web Experience

A cutting-edge, highly interactive web portfolio project focusing on phenomenal UI/UX, optimal performance, and modern web aesthetics. This repository serves as the foundation for creating an immersive, SEO-optimized, and animation-rich developer portfolio.

## ✨ Features

- **Immersive 3D Graphics**: Leveraging the power of `@react-three/fiber` and `three.js` to create engaging interactive WebGL scenes.
- **Silky Smooth Animations**: Complex motion sequences, timeline management, and micro-interactions powered by **GSAP** and `@gsap/react`.
- **Premium UI/UX Design**: Built with an eye for exceptional aesthetics, beautiful color palettes, smooth gradients, and elegant typography.
- **Optimized for SEO & Accessibility**: Adheres to strict web standards, utilizing semantic HTML, proper header structures, metadata, and ARIA labels.
- **Performance First**: Built with efficient asset loading practices and fully responsive design using **Tailwind CSS**.
- **Type-Safe**: Written primarily in rigorous TypeScript to ensure an error-free, maintainable codebase.

## 🛠 Tech Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Engine**: ThreeJS, React Three Fiber, React Three Drei
- **Animations**: GSAP
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

[Bun](https://bun.sh/) (or run `direnv allow` / `nix develop` to get Node 22 + Bun from the flake).

### Commands

```bash
bun install        # install dependencies
bun run dev        # dev server on http://localhost:5173
bun run build      # type-check + production build into dist/
bun run preview    # serve the production build locally
```

### Environment

Copy `.env.example` to `.env` and set `VITE_SITE_URL` to the deployed origin
(e.g. `https://example.dev`). When set, the build adds the canonical URL,
`og:url`, absolute social-image URLs, `sitemap.xml` and a `Sitemap:` line in
`robots.txt`. Without it the site still builds; those URL-dependent tags are omitted.

## 🌍 Deployment (Cloudflare Pages, free)

The site is fully static (`dist/`), so any static host works. Cloudflare Pages
is free with unlimited bandwidth, a custom domain and HTTPS.

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**,
   pick this repo and the `main` branch.
2. Build settings:
   - Framework preset: **None**
   - Build command: `bun install --frozen-lockfile && bun run build`
   - Build output directory: `dist`
3. Environment variables (Production):
   - `SKIP_DEPENDENCY_INSTALL` = `true` (Bun installs dependencies in the build command)
   - `BUN_VERSION` = `1.4.4`
   - `VITE_SITE_URL` = `https://your-domain` (enables canonical URL + sitemap)
4. **Custom domains → Set up a domain**. A root domain (`example.com`) needs the
   domain's DNS on Cloudflare (free); a subdomain can be a CNAME at any registrar.

Every push to `main` deploys automatically; other branches get preview URLs.
Caching and security headers come from `public/_headers`.

## 📖 Development Guidelines

AI-assistant rules, skills and workflows live in `.cursor/` (Cursor) and
`.agents/` (Antigravity): coding standards, UI/UX and animation conventions,
SEO/accessibility requirements and the Conventional Commits git workflow.
