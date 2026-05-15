"use client";

import { useState } from "react";
import { Loader2, Wallet, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useAppStore } from "@/store/app-store";
import { formatAmount, shortenAddress, stellarExplorerUrl } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Settlement } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlement: Settlement;
  currency: string;
  groupId: string;
  onPaid: () => void;
}

type Step = "confirm" | "signing" | "success" | "error";

export function PaymentDialog({ open, onOpenChange, settlement, currency, groupId, onPaid }: Props) {
  const { walletAddress, walletConnected, connect, signAndSubmit } = useWallet();
  const { user } = useAppStore();
  const [step, setStep] = useState<Step>("confirm");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";

  const handlePay = async () => {
    if (!walletConnected) {
      await connect();
      return;
    }

    setStep("signing");
    try {
      // 1. Build the transaction on the server
      const buildRes = await fetch("/api/stellar/build-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: walletAddress,
          receiverAddress: settlement.toUserId, // will be resolved to stellar address server-side
          receiverUserId: settlement.toUserId,
          amount: settlement.amount.toFixed(7),
          currency,
          memo: `StellarSplit: ${groupId.slice(0, 10)}`,
        }),
      });

      const buildData = await buildRes.json();
      if (!buildRes.ok) throw new Error(buildData.error ?? "Failed to build transaction");

      // 2. Sign with Freighter and submit
      const hash = await signAndSubmit(buildData.xdr);

      // 3. Record the payment in our DB
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: settlement.amount,
          currency,
          receiverId: settlement.toUserId,
          stellarTxHash: hash,
          memo: `StellarSplit: ${groupId.slice(0, 10)}`,
        }),
      });

      setTxHash(hash);
      setStep("success");
      toast({ title: "Payment sent!", description: `${formatAmount(settlement.amount, currency)} to ${settlement.toName}` });
      onPaid();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setErrorMsg(msg);
      setStep("error");
      toast({ title: "Payment failed", description: msg, variant: "destructive" });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setStep("confirm"); setTxHash(null); setErrorMsg(null); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Payment</DialogTitle>
          <DialogDescription>
            Settle your debt via the Stellar blockchain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "confirm" && (
            <>
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{settlement.toName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">{formatAmount(settlement.amount, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <Badge variant="outline" className="capitalize">{network}</Badge>
                </div>
              </div>

              {!walletConnected && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Connect your Freighter wallet to send payments</span>
                </div>
              )}

              {walletConnected && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-sm">
                  <Wallet className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="font-mono">{shortenAddress(walletAddress!)}</span>
                  <Badge variant="success" className="ml-auto text-xs">Connected</Badge>
                </div>
              )}
            </>
          )}

          {step === "signing" && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="font-medium">Waiting for signature...</p>
              <p className="text-sm text-muted-foreground">Approve the transaction in Freighter</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <p className="font-semibold text-lg">Payment sent!</p>
              <p className="text-sm text-muted-foreground">
                {formatAmount(settlement.amount, currency)} sent to {settlement.toName}
              </p>
              {txHash && (
                <Button variant="outline" size="sm" asChild className="gap-1">
                  <a
                    href={stellarExplorerUrl(txHash, network)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="py-6 text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
              <p className="font-semibold">Payment failed</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button variant="gradient" onClick={handlePay} className="gap-2">
                <Wallet className="h-4 w-4" />
                {walletConnected ? "Send Payment" : "Connect & Pay"}
              </Button>
            </>
          )}
          {(step === "success" || step === "error") && (
            <Button onClick={handleClose} className="w-full">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
