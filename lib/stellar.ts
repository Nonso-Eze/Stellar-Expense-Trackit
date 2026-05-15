// Stellar SDK helpers for payment operations
// This file is SERVER-ONLY — never import it in client components
import "server-only";
import {
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const server = new Horizon.Server(HORIZON_URL);
export const networkPassphrase =
  NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

/** USDC asset on testnet/mainnet */
export const USDC = new Asset(
  "USDC",
  process.env.NEXT_PUBLIC_USDC_ISSUER ??
    "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

/**
 * Build an XLM payment transaction (unsigned).
 * The Freighter wallet will sign it client-side.
 */
export async function buildXLMPaymentTx(
  senderAddress: string,
  receiverAddress: string,
  amount: string,
  memo?: string
): Promise<string> {
  const account = await server.loadAccount(senderAddress);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: receiverAddress,
        asset: Asset.native(),
        amount,
      })
    )
    .addMemo(memo ? Memo.text(memo.slice(0, 28)) : Memo.none())
    .setTimeout(180)
    .build();

  return tx.toXDR();
}

/**
 * Build a USDC payment transaction (unsigned).
 */
export async function buildUSDCPaymentTx(
  senderAddress: string,
  receiverAddress: string,
  amount: string,
  memo?: string
): Promise<string> {
  const account = await server.loadAccount(senderAddress);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: receiverAddress,
        asset: USDC,
        amount,
      })
    )
    .addMemo(memo ? Memo.text(memo.slice(0, 28)) : Memo.none())
    .setTimeout(180)
    .build();

  return tx.toXDR();
}

/**
 * Submit a signed XDR transaction to the Stellar network.
 * Returns the transaction hash on success.
 */
export async function submitTransaction(signedXDR: string): Promise<string> {
  const { TransactionBuilder } = await import("@stellar/stellar-sdk");
  const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

/**
 * Fetch the XLM and USDC balances for a Stellar account.
 */
export async function getAccountBalances(
  address: string
): Promise<{ xlm: string; usdc: string }> {
  try {
    const account = await server.loadAccount(address);
    let xlm = "0";
    let usdc = "0";

    for (const balance of account.balances) {
      if (balance.asset_type === "native") {
        xlm = parseFloat(balance.balance).toFixed(2);
      } else if (
        balance.asset_type === "credit_alphanum4" &&
        balance.asset_code === "USDC"
      ) {
        usdc = parseFloat(balance.balance).toFixed(2);
      }
    }

    return { xlm, usdc };
  } catch {
    return { xlm: "0", usdc: "0" };
  }
}

/**
 * Check if an account exists on the Stellar network.
 */
export async function accountExists(address: string): Promise<boolean> {
  try {
    await server.loadAccount(address);
    return true;
  } catch {
    return false;
  }
}
