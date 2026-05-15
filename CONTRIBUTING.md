# Contributing to StellarSplit

Thanks for your interest in contributing. Here's everything you need to get started.

## Code Style

- TypeScript strict mode — no `any` unless absolutely necessary
- Functional components only — no class components
- Use `const` over `let` where possible
- Prefer named exports over default exports for components
- Keep components small and focused — extract when a component exceeds ~150 lines
- Use Tailwind utility classes; avoid inline styles
- All user-facing strings should be readable and consistent in tone

## Branch Naming

```
feat/short-description       # New feature
fix/short-description        # Bug fix
chore/short-description      # Tooling, deps, config
docs/short-description       # Documentation only
refactor/short-description   # Code restructure, no behavior change
```

Examples:
- `feat/custom-split-amounts`
- `fix/wallet-reconnect-on-reload`
- `docs/update-setup-guide`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

Examples:
```
feat(groups): add custom split amounts
fix(wallet): handle freighter not installed error
docs(readme): add deployment section
```

## Pull Request Process

1. Fork the repo and create your branch from `main`
2. Make your changes with clear, focused commits
3. Ensure the app builds without errors: `npm run build`
4. Run lint: `npm run lint`
5. Update documentation if your change affects setup or usage
6. Open a PR with a clear title and description:
   - What does this PR do?
   - Why is this change needed?
   - Any screenshots for UI changes?
7. Request a review — PRs need at least one approval before merging

## Issue Reporting

When filing a bug report, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS
- Any relevant console errors

For feature requests, describe:
- The problem you're solving
- Your proposed solution
- Any alternatives you considered

## Local Setup

```bash
git clone https://github.com/your-username/stellar-expense-splitter
cd stellar-expense-splitter
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed   # optional
npm run dev
```

## Testing

Currently the project uses manual testing. When adding new features:

- Test the happy path
- Test error states (network failure, missing wallet, etc.)
- Test on mobile viewport (Chrome DevTools)
- Test in both light and dark mode

To run a production build locally:

```bash
npm run build
npm run start
```

## Database Changes

If your PR modifies `prisma/schema.prisma`:

1. Run `npm run db:generate` to regenerate the Prisma client
2. Run `npm run db:push` to apply schema changes to the local DB
3. Update the seed file if new required data is needed
4. Document the migration in your PR description

## Questions?

Open a GitHub Discussion or reach out in the issues tab.
