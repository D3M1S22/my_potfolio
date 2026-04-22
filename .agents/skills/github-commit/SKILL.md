---
name: github-commit
description: Commit and push all changes to GitHub with a conventional commit message. Use when the user asks to commit, save, push, or sync to GitHub.
---

# GitHub Commit & Push (Antigravity)

Commit all changes to GitHub using Conventional Commits.

## When to Use

- User says "commit", "push", "save to GitHub", or "sync"
- After any significant feature, fix, or refactor is complete
- When explicitly asked to run the git workflow

## Instructions

1. Check status:
   ```bash
   git status && git diff --stat
   ```

2. Craft the best commit message (Conventional Commits):
   - `feat:` new feature/component
   - `fix:` bug fix
   - `refactor:` restructure
   - `style:` styling only
   - `perf:` performance
   - `docs:` documentation
   - `chore:` deps/config/tooling

3. Run sequentially:
   ```bash
   git add .
   git commit -m "<type>(<scope>): <description>"
   git push
   ```

## Good Examples

```
feat(hero): add GSAP scroll-triggered parallax animation
fix(mobile): resolve viewport overflow on hero section
refactor(three): extract R3F scene into reusable hook
perf(bundle): lazy-load ThreeJS with React.lazy
chore(deps): update all packages via bun update
```
