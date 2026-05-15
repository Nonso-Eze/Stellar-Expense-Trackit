import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as currency */
export function formatAmount(amount: number, currency = "XLM"): string {
  if (currency === "XLM") {
    return `${amount.toFixed(2)} XLM`;
  }
  return `${amount.toFixed(2)} USDC`;
}

/** Shorten a Stellar address for display */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Calculate who owes who in a group based on expense shares */
export interface Balance {
  userId: string;
  displayName: string;
  net: number; // positive = owed money, negative = owes money
}

export interface Settlement {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

/**
 * Simplify debts: given a list of balances, compute the minimal
 * set of payments to settle all debts.
 */
export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Separate creditors (net > 0) and debtors (net < 0)
  const creditors = balances
    .filter((b) => b.net > 0.001)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  const debtors = balances
    .filter((b) => b.net < -0.001)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i];
    const debt = debtors[j];
    const amount = Math.min(credit.net, -debt.net);

    settlements.push({
      fromUserId: debt.userId,
      fromName: debt.displayName,
      toUserId: credit.userId,
      toName: credit.displayName,
      amount: parseFloat(amount.toFixed(7)),
    });

    credit.net -= amount;
    debt.net += amount;

    if (Math.abs(credit.net) < 0.001) i++;
    if (Math.abs(debt.net) < 0.001) j++;
  }

  return settlements;
}

/** Format a date nicely */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Stellar Explorer URL for a transaction */
export function stellarExplorerUrl(txHash: string, network = "testnet"): string {
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";
  return `${base}/tx/${txHash}`;
}
