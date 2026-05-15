// Global app state using Zustand
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  displayName: string;
  stellarAddress?: string | null;
}

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Wallet
  walletAddress: string | null;
  walletConnected: boolean;
  setWallet: (address: string | null) => void;

  // Balances
  xlmBalance: string;
  usdcBalance: string;
  setBalances: (xlm: string, usdc: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      walletAddress: null,
      walletConnected: false,
      setWallet: (address) =>
        set({ walletAddress: address, walletConnected: !!address }),

      xlmBalance: "0",
      usdcBalance: "0",
      setBalances: (xlm, usdc) => set({ xlmBalance: xlm, usdcBalance: usdc }),
    }),
    {
      name: "stellar-splitter-store",
      // Only persist user session, not balances
      partialize: (state) => ({ user: state.user }),
    }
  )
);
