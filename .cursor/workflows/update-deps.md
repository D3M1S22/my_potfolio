---
description: "Dependency update workflow: check outdated → update with bun → verify build → commit."
alwaysApply: false
---

# Workflow: Update Dependencies

**Trigger:** When user asks to update packages, upgrade dependencies, or keep packages fresh.

## Steps

1. **Check what's outdated**
   ```bash
   bun outdated
   ```

2. **Update all packages**
   ```bash
   bun update
   ```
   Or update a specific package:
   ```bash
   bun update <package-name>@latest
   ```

3. **Verify the build still works**
   ```bash
   bun run build
   ```

4. **Run dev server and spot-check visually**
   ```bash
   bun run dev
   ```

5. **Fix any breaking changes** (especially for major version bumps in gsap, three, or react)

6. **Commit the lockfile update**
   ```bash
   git add package.json bun.lockb
   git commit -m "chore(deps): update all packages to latest"
   git push
   ```

## Notes

- Always use `bun` — never `npm update` or `yarn upgrade`
- After major GSAP updates, check ScrollTrigger registration
- After major three.js updates, check R3F compatibility (`@react-three/fiber` and `@react-three/drei` must stay in sync)
