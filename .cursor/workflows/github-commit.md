---
description: "GitHub commit workflow: stage, commit with Conventional Commits, and push to origin."
alwaysApply: false
---

# Workflow: GitHub Commit & Push

**Trigger:** When user says "commit", "push", "save to GitHub", or after a significant milestone.

## Steps

1. **Check what changed**
   ```bash
   git status && git diff --stat
   ```

2. **Determine the commit type** based on changes:
   | Type | When |
   |---|---|
   | `feat` | New feature, component, or visual |
   | `fix` | Bug or regression fix |
   | `refactor` | Code restructure, no behavior change |
   | `style` | Styling only (Tailwind, CSS vars) |
   | `perf` | Performance optimization |
   | `docs` | README, comments, documentation |
   | `chore` | Deps, config, tooling |

3. **Run sequentially (never combine)**
   ```bash
   git add .
   git commit -m "<type>(<scope>): <description>"
   git push
   ```

## Commit Message Rules

- Max 72 chars in subject line
- Use imperative mood: "add hero animation" not "added"
- Reference scope when useful: `feat(hero)`, `fix(mobile)`, `refactor(three)`

## Good Examples

```
feat(hero): add GSAP scroll-triggered parallax to landing section
fix: resolve mobile viewport overflow caused by R3F canvas
refactor(three): extract animated sphere into reusable HeroSphere component
style: update color palette to cohesive HSL design token system
perf: lazy-load ThreeJS canvas with React.lazy + Suspense
chore(deps): upgrade all packages to latest via bun update
```

## After Push

Confirm with: `git log --oneline -5`
