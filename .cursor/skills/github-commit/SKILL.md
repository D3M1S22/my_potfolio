---
name: github-commit
description: Commit and push all changes to GitHub with a conventional commit message. Use when the user asks to commit, save, push, or sync to GitHub.
---

# GitHub Commit & Push

Commit all staged and unstaged changes to GitHub using Conventional Commits.

## When to Use

- User says "commit", "push", "save to GitHub", or "sync"
- After any significant feature, fix, or refactor is complete
- When explicitly asked to run the git workflow

## Instructions

1. Check git status to see what changed:
   ```bash
   git status
   git diff --stat
   ```

2. Review the changes and craft the best possible commit message following Conventional Commits:
   - `feat:` — new feature or component
   - `fix:` — bug fix
   - `refactor:` — code restructure
   - `style:` — styling/UI only
   - `perf:` — performance improvement
   - `docs:` — documentation
   - `chore:` — deps, config, tooling

3. Run sequentially — never combine:
   ```bash
   git add .
   git commit -m "<type>(<optional-scope>): <concise description>"
   git push
   ```

## Good Commit Examples

```
feat(hero): add GSAP scroll-triggered parallax animation
fix(mobile): resolve viewport overflow on hero section
refactor(three): extract R3F scene into reusable hook
style(tokens): switch palette to HSL CSS custom properties
perf(bundle): lazy-load ThreeJS scene with React.lazy
docs: update README with latest stack and dev setup
chore(deps): update all packages to latest via bun
```

## Rules

- **Never** commit `node_modules`, `.env`, or build artifacts
- Always verify `git status` before committing
- Write messages the team can understand at a glance from the log
