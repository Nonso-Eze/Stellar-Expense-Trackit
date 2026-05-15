# Stellar Expense Splitter

A production-ready MVP for splitting bills and settling payments using the Stellar blockchain (XLM or USDC).

![StellarSplit Banner](public/banner-placeholder.png)

## Overview

StellarSplit lets friends track shared expenses and settle debts instantly using the Stellar network. No bank delays, no fees, full transparency.

## Features

- **Expense Groups** — Create groups for trips, dinners, or shared living
- **Smart Splitting** — Automatically calculates who owes who and simplifies debts
- **Stellar Payments** — Pay back friends with XLM or USDC via Freighter wallet
- **Transaction History** — Full payment history with Stellar Explorer links
- **Dark/Light Mode** — System-aware theme with manual toggle
- **Mobile First** — Fully responsive design

## Screenshots

| Landing | Dashboard | Group Detail |
|---------|-----------|--------------|
| ![Landing](public/screenshot-landing.png) | ![Dashboard](public/screenshot-dashboard.png) | ![Group](public/screenshot-group.png) |

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Blockchain**: Stellar SDK, Freighter wallet
- **Backend**: Next.js API routes
- **Database**: SQLite + Prisma ORM
- **State**: Zustand
- **Deployment**: Vercel-ready

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- [Freighter wallet extension](https://www.freighter.app/) (for payments)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/stellar-expense-splitter
cd stellar-expense-splitter

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Generate Prisma client and create the database
npm run db:generate
npm run db:push

# 5. (Optional) Seed with example data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` | `testnet` |
| `NEXT_PUBLIC_HORIZON_URL` | Stellar Horizon server URL | testnet URL |
| `NEXT_PUBLIC_USDC_ISSUER` | USDC asset issuer address | testnet issuer |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `http://localhost:3000` |

## Wallet Setup

1. Install [Freighter](https://www.freighter.app/) browser extension
2. Create or import a Stellar wallet
3. Switch to **Testnet** in Freighter settings for development
4. Fund your testnet account at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
5. Click "Connect Wallet" in the app navbar

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# For production, switch NEXT_PUBLIC_STELLAR_NETWORK to "mainnet"
```

For production, consider migrating from SQLite to PostgreSQL by updating `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Future Improvements

- [ ] Custom split amounts (not just equal)
- [ ] Recurring expenses
- [ ] Email/push notifications for payment requests
- [ ] Multi-currency conversion
- [ ] Export to CSV
- [ ] Mobile app (React Native)
- [ ] Social login (Google, GitHub)
- [ ] Group invites via link

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
