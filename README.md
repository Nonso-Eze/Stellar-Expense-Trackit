# 🌟 Stellar Expense Trackit

> Split bills with friends. Settle instantly on the Stellar blockchain.

[![CI](https://github.com/Nonso-Eze/Stellar-Expense-Trackit/actions/workflows/ci.yml/badge.svg)](https://github.com/Nonso-Eze/Stellar-Expense-Trackit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black)](https://nextjs.org)
[![Stellar](https://img.shields.io/badge/Powered%20by-Stellar-blue)](https://stellar.org)

---

## What is this?

Stellar Expense Trackit lets groups of friends track shared expenses and settle debts instantly using XLM or USDC on the Stellar network. No bank delays, no fees, full on-chain transparency.

Think Splitwise — but payments actually settle on a blockchain in under 5 seconds.

---

## ✨ Features

- **Expense Groups** — create groups for trips, dinners, shared living, anything
- **Smart Splitting** — equal splits with automatic debt simplification
- **Stellar Payments** — pay back friends with XLM or USDC via Freighter wallet
- **Transaction History** — full payment history with Stellar Explorer links
- **Dark / Light Mode** — system-aware with manual toggle
- **Mobile First** — fully responsive on all screen sizes

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Blockchain | Stellar SDK, Freighter wallet |
| Backend | Next.js API routes |
| Database | SQLite + Prisma ORM |
| State | Zustand |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Freighter wallet extension](https://www.freighter.app/) for payments

### Local Setup

```bash
# 1. Fork and clone the repo
git clone https://github.com/Nonso-Eze/Stellar-Expense-Trackit.git
cd Stellar-Expense-Trackit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Set up the database
npm run db:generate
npm run db:push

# 5. (Optional) Seed with example data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with username `alice` (from seed data).

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite path (or Postgres URL for prod) | `file:./dev.db` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` | `testnet` |
| `NEXT_PUBLIC_HORIZON_URL` | Stellar Horizon server | testnet URL |
| `NEXT_PUBLIC_USDC_ISSUER` | USDC asset issuer address | testnet issuer |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `http://localhost:3000` |

---

## 👛 Wallet Setup

1. Install [Freighter](https://www.freighter.app/) browser extension
2. Create or import a Stellar wallet
3. Switch to **Testnet** in Freighter settings
4. Fund your testnet account at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
5. Click **Connect Wallet** in the app navbar

---

## 🌍 Deployment

### Vercel (recommended)

```bash
npx vercel
```

Set environment variables in the Vercel dashboard. For production, swap SQLite for Postgres (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run `npx prisma db push` against your production DB URL.

### CI/CD (GitHub Actions)

The repo ships with two workflows:

- **CI** — runs on every push and PR: lint → type check → build
- **Deploy** — auto-deploys to Vercel on merge to `main`, posts a preview URL comment on PRs

To enable the deploy workflow, add these secrets in your GitHub repo settings (`Settings → Secrets → Actions`):

| Secret | Where to get it |
|--------|----------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Run `vercel link` locally, then check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same as above |

---

## 🗺 Roadmap

- [ ] Custom split amounts (not just equal)
- [ ] Recurring expenses
- [ ] Payment request notifications
- [ ] Multi-currency conversion
- [ ] Export to CSV
- [ ] Group invite links
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are what make open source great. Any contribution you make is genuinely appreciated.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide — it covers everything from first-time setup to submitting a PR.

**Quick version:**

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Stellar-Expense-Trackit.git

# 3. Create a branch
git checkout -b feat/your-feature-name

# 4. Make your changes, then commit
git commit -m "feat: add your feature"

# 5. Push and open a PR
git push origin feat/your-feature-name
```

Not sure where to start? Check the [open issues](https://github.com/Nonso-Eze/Stellar-Expense-Trackit/issues) — anything tagged `good first issue` is a great entry point.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with ❤️ on the Stellar network</p>
