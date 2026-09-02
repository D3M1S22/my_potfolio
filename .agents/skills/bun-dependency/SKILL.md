---
name: bun-dependency
description: Add, remove, or update packages using Bun. Use when installing packages, upgrading deps, or running scripts. NEVER use npm or yarn.
---

# Bun Dependency Management (Antigravity)

## Essential Commands

```bash
# Install
bun add <package>              # production
bun add -d <package>           # dev dependency
bun add <package>@latest       # specific version

# Remove
bun remove <package>

# Update
bun update                     # all packages
bun update <package>           # specific

# Run scripts
bun run dev                    # dev server
bun run build                  # production build
bun install                    # restore from lockfile
```

## Stack Packages

| Role | Package |
|---|---|
| Animations | `gsap`, `@gsap/react` |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` |
| Styling | `tailwindcss`, `postcss`, `autoprefixer` |
| Build | `vite`, `@vitejs/plugin-react` |
| Types | `@types/react`, `@types/react-dom` |

## Rule: NEVER npm or yarn — Bun ONLY.
