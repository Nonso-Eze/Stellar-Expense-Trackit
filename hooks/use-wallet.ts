"use client";

// Hook for Freighter wallet integration
// Freighter is a browser extension wallet for Stellar
import { useState, useCallback, useEffect } from "react";
import { useAppStore } from "@/store/app-store";

// Type declarations for the Freighter browser extension API
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, opts?: { network?: string }) => Promise<string>;
      getNetwork: () => Promise<string>;
    };
  }
}

export function useWallet() {
  const { walletAddress, walletConnected, setWallet, setBalances } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freighterAvailable, setFreighterAvailable] = useState(false);

  // Check if Freighter extension is installed
  useEffect(() => {
    const check = async () => {
      if (typeof window !== "undefined" && window.freighter) {
        setFreighterAvailable(true);
        // Auto-reconnect if previously connected
        try {
          const connected = await window.freighter.isConnected();
          if (connected) {
            const address = await window.freighter.getPublicKey();
            setWallet(address);
            fetchBalances(address);
          }
        } catch {
          // Silently fail on auto-reconnect
        }
      }
    };
    check();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Fetch XLM and USDC balances from the API */
  const fetchBalances = useCallback(async (address: string) => {
    try {
      const res = await fetch(`/api/stellar/balances?address=${address}`);
      if (res.ok) {
        const data = await res.json();
        setBalances(data.xlm, data.usdc);
      }
    } catch {
      // Non-critical — balances will show as 0
    }
  }, [setBalances]);

  /** Connect Freighter wallet */
  const connect = useCallback(async () => {
    if (!window.freighter) {
      setError("Freighter wallet not found. Please install the extension.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const address = await window.freighter.getPublicKey();
      setWallet(address);
      await fetchBalances(address);

      // Save wallet address to user profile
      await fetch("/api/user/wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stellarAddress: address }),
      });
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalances, setWallet]);

  /** Disconnect wallet */
  const disconnect = useCallback(() => {
    setWallet(null);
    setBalances("0", "0");
  }, [setWallet, setBalances]);

  /**
   * Sign and submit a payment transaction via Freighter.
   * Returns the transaction hash on success.
   */
  const signAndSubmit = useCallback(
    async (xdr: string): Promise<string> => {
      if (!window.freighter) throw new Error("Freighter not available");

      const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
      const networkName = network === "mainnet" ? "PUBLIC" : "TESTNET";

      // Freighter signs the XDR and returns the signed XDR
      const signedXDR = await window.freighter.signTransaction(xdr, {
        network: networkName,
      });

      // Submit via our API route (server-side submission)
      const res = await fetch("/api/stellar/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXDR }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Transaction failed");
      }

      const data = await res.json();
      return data.hash;
    },
    []
  );

  return {
    walletAddress,
    walletConnected,
    freighterAvailable,
    isLoading,
    error,
    connect,
    disconnect,
    signAndSubmit,
    refreshBalances: () => walletAddress && fetchBalances(walletAddress),
  };
}
