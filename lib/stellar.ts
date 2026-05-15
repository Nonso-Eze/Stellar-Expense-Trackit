// Stellar SDK helpers — SERVER ONLY
// All SDK imports are lazy (inside functions) to prevent Vercel build-time crashes
// caused by sodium-native's native addon being evaluated during static analysis.

import "server-only";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

/** Get a configured Horizon server instance */
async function getServer() {
  const { Horizon } = await import("@stellar/stellar-sdk");
  return new Horizon.Server(HORIZON_URL);
}

/** Get the network passphrase */
async function getNetworkPassphrase() {
  const { Networks } = await import("@stellar/stellar-sdk");
  return NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

/** USDC asset */
async function getUSDC() {
  const { Asset } = await import("@stellar/stellar-sdk");
  return new Asset(
    "USDC",
    process.env.NEXT_PUBLIC_USDC_ISSUER ??
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
  );
}

/**
 * Build an unsigned XLM payment transaction.
 * Returns the XDR string for Freighter to sign.
 */
export async function buildXLMPaymentTx(
  senderAddress: string,
  receiverAddress: string,
  amount: string,
  memo?: string
): Promise<string> {
  const { TransactionBuilder, Operation, Asset, Memo, BASE_FEE } =
    await import("@stellar/stellar-sdk");
  const server = await getServer();
  const networkPassphrase = await getNetworkPassphrase();
  const account = await server.loadAccount(senderAddress);

  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
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
 * Build an unsigned USDC payment transaction.
 */
export async function buildUSDCPaymentTx(
  senderAddress: string,
  receiverAddress: string,
  amount: string,
  memo?: string
): Promise<string> {
  const { TransactionBuilder, Operation, Memo, BASE_FEE } =
    await import("@stellar/stellar-sdk");
  const server = await getServer();
  const networkPassphrase = await getNetworkPassphrase();
  const usdc = await getUSDC();
  const account = await server.loadAccount(senderAddress);

  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
    .addOperation(
      Operation.payment({
        destination: receiverAddress,
        asset: usdc,
        amount,
      })
    )
    .addMemo(memo ? Memo.text(memo.slice(0, 28)) : Memo.none())
    .setTimeout(180)
    .build();

  return tx.toXDR();
}

/**
 * Submit a signed XDR transaction to Stellar.
 * Returns the transaction hash.
 */
export async function submitTransaction(signedXDR: string): Promise<string> {
  const { TransactionBuilder } = await import("@stellar/stellar-sdk");
  const server = await getServer();
  const networkPassphrase = await getNetworkPassphrase();
  const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

/**
 * Fetch XLM and USDC balances for a Stellar account.
 */
export async function getAccountBalances(
  address: string
): Promise<{ xlm: string; usdc: string }> {
  try {
    const server = await getServer();
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
 * Check if a Stellar account exists on the network.
 */
export async function accountExists(address: string): Promise<boolean> {
  try {
    const server = await getServer();
    await server.loadAccount(address);
    return true;
  } catch {
    return false;
  }
}
