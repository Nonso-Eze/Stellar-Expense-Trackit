# Contributing to Stellar Expense Trackit

First off — thank you for taking the time to contribute! 🎉

This project is open to everyone. Whether you're fixing a typo, squashing a bug, or building a whole new feature, your help is welcome.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Local Setup](#local-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

Be kind. Be respectful. We're all here to build something cool together. Harassment of any kind won't be tolerated.

---

## How Can I Contribute?

There are lots of ways to help beyond writing code:

- 🐛 **Report bugs** — open an issue with steps to reproduce
- 💡 **Suggest features** — open an issue describing the problem you want to solve
- 📖 **Improve docs** — fix typos, clarify setup steps, add examples
- 🧪 **Write tests** — the project currently has no automated tests — this is a great first contribution
- 🎨 **Improve UI** — better layouts, animations, accessibility improvements
- 🌍 **Add translations** — help make the app multilingual

---

## Local Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Stellar-Expense-Trackit.git
cd Stellar-Expense-Trackit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Set up the database
npm run db:generate
npm run db:push

# 5. Seed example data (optional but recommended)
npm run db:seed

# 6. Start the dev server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

Seed users you can log in with: `alice`, `bob`, `carol`, `dave`

---

## Branch Naming

Use a short, descriptive name with a prefix:

| Prefix | Use for |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Tooling, deps, config |
| `refactor/` | Code restructure, no behavior change |
| `test/` | Adding or updating tests |

Examples:
```
feat/custom-split-amounts
fix/wallet-reconnect-on-reload
docs/improve-setup-guide
chore/upgrade-prisma
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

[optional body — explain the why, not the what]

[optional footer — e.g. Closes #42]
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`

Good examples:
```
feat(groups): add custom split amounts per member
fix(wallet): handle freighter extension not installed
docs(readme): add wallet setup instructions
chore: upgrade stellar-sdk to v12
```

Keep the summary under 72 characters. Use the body to explain *why* if the change isn't obvious.

---

## Pull Request Process

1. **Fork** the repo and create your branch from `main`
2. **Make your changes** with focused, atomic commits
3. **Test your changes** — run the app locally and verify nothing is broken
4. **Run the build** to catch type errors: `npm run build`
5. **Run the linter**: `npm run lint`
6. **Open a PR** against `main` with:
   - A clear title following the commit convention
   - A description of *what* changed and *why*
   - Screenshots or a short screen recording for any UI changes
   - Reference to any related issues (e.g. `Closes #42`)

PRs need at least one review before merging. Be patient — reviewers are volunteers too.

### PR checklist

- [ ] My code follows the project's code style
- [ ] I've tested the happy path and error states
- [ ] I've tested on mobile viewport
- [ ] I've tested in both light and dark mode
- [ ] The build passes (`npm run build`)
- [ ] The linter passes (`npm run lint`)
- [ ] I've updated documentation if needed

---

## Code Style

- **TypeScript strict mode** — avoid `any`; if you must use it, add a comment explaining why
- **Functional components only** — no class components
- **Named exports** preferred over default exports for components
- **Small, focused components** — if a component exceeds ~150 lines, consider splitting it
- **Tailwind utility classes** — avoid inline styles
- **Comments** — explain *why*, not *what*; the code should speak for itself

---

## Reporting Bugs

Open an issue and include:

- A clear title
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS
- Any relevant console errors or screenshots

The more detail, the faster it gets fixed.

---

## Suggesting Features

Open an issue and describe:

- The problem you're trying to solve (not just the solution)
- Your proposed approach
- Any alternatives you considered
- Mockups or examples if relevant

Features that solve a real problem for multiple users are most likely to be picked up.

---

## Questions?

Open a [GitHub Discussion](https://github.com/Nonso-Eze/Stellar-Expense-Trackit/discussions) or drop a comment on a relevant issue. We're happy to help you get started.
