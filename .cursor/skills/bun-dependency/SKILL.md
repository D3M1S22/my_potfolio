---
name: bun-dependency
description: Add, remove, or update project dependencies using Bun. Use when installing packages, upgrading deps, or running scripts.
---

# Bun Dependency Management

Manage all project dependencies exclusively with Bun — never npm or yarn.

## When to Use

- User asks to install a package
- Updating/upgrading dependencies
- Running scripts
- Checking what's installed

## Commands Reference

### Install a new dependency
```bash
bun add <package-name>               # production dependency
bun add -d <package-name>            # dev dependency
bun add <package-name>@latest        # latest version
bun add <pkg1> <pkg2>                # multiple at once
```

### Remove a dependency
```bash
bun remove <package-name>
```

### Update all packages
```bash
bun update                           # update all to latest compatible
bun update <package-name>            # update specific package
```

### Run scripts
```bash
bun run dev                          # start dev server
bun run build                        # production build
bun run preview                      # preview production build
bun run lint                         # lint check
bun install                          # restore from bun.lockb
```

### Inspect
```bash
bun pm ls                            # list installed packages
bun outdated                         # check for outdated packages
```

## Key Stack Packages

| Category | Package |
|---|---|
| Core | `react`, `react-dom` |
| Types | `@types/react`, `@types/react-dom` |
| Build | `vite`, `@vitejs/plugin-react` |
| Styling | `tailwindcss`, `autoprefixer`, `postcss` |
| Animation | `gsap`, `@gsap/react` |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` |
| TS | `typescript` |

## Rules

- **NEVER** use `npm install`, `yarn add`, or `pnpm add`
- Always commit `bun.lockb` to version control
- After `bun add`, verify the package appears in `package.json`
