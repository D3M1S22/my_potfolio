---
description: "Dependency update workflow: check outdated → update with bun → verify build → commit."
alwaysApply: false
---

# Workflow: Update Dependencies

**Trigger:** User asks to update, upgrade, or refresh packages.

## Steps

1. **Check what's outdated**
   ```bash
   bun outdated
   ```

2. **Update all**
   ```bash
   bun update
   ```

3. **Verify build**
   ```bash
   bun run build
   ```

4. **Spot-check in browser**
   ```bash
   bun run dev
   ```

5. **Fix breaking changes** if needed
   - GSAP major: check ScrollTrigger registration syntax
   - three.js major: verify R3F compatibility (`@react-three/fiber`, `@react-three/drei` must align)
   - React major: check deprecated APIs

6. **Commit**
   ```bash
   git add package.json bun.lockb
   git commit -m "chore(deps): update all packages to latest"
   git push
   ```

## Rule: ALWAYS use `bun update` — never npm or yarn.
