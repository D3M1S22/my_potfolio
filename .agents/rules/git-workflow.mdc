---
trigger: always_on
description: "GitHub workflow: Conventional Commits, commit prompting after milestones, sequential git commands."
---

# GitHub Workflow (Antigravity)

## When to Prompt for a Commit

After every significant edit, major refactor, or successful milestone, ask:

> *"Would you like me to commit and push these updates to GitHub?"*

## If User Agrees — Run These Commands

```bash
git add .
git commit -m "<type>: <concise description>"
git push
```

Always run **sequentially** — never combine.

## Conventional Commits Format

```
<type>(<optional scope>): <description>
```

### Types
| Type | When to Use |
|---|---|
| `feat` | New feature, component, or section |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `style` | Styling/UI only (no logic changes) |
| `perf` | Performance improvement |
| `docs` | Documentation, README, comments |
| `chore` | Build config, deps, tooling changes |

### Good Examples
```
feat: add GSAP scroll-triggered hero animation
feat(three): add rotating 3D sphere to about section  
fix: correct mobile viewport overflow on hero section
refactor: extract ProjectCard into reusable component
style: switch color palette to HSL design tokens
perf: lazy-load ThreeJS scene with React.lazy
docs: update README with Bun setup instructions
chore: update all deps to latest versions via bun
```

### Bad Examples (avoid)
```
update stuff
fixed bug
WIP
changes
```