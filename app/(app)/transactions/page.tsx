"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, CheckCircle2, Clock, XCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { formatAmount, formatDate, stellarExplorerUrl } from "@/lib/utils";
import type { Payment } from "@/types";

export default function TransactionsPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .finally(() => setIsLoading(false));
  }, [user, router]);

  const pending = payments.filter((p) => p.status === "PENDING");
  const completed = payments.filter((p) => p.status === "COMPLETED");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Transactions</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Card key={i} className="h-20 shimmer" />)}
        </div>
      ) : payments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Payments will appear here once you settle expenses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending ({pending.length})
              </h2>
              {pending.map((p) => (
                <PaymentRow key={p.id} payment={p} currentUserId={user!.id} />
              ))}
            </section>
          )}

          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Completed ({completed.length})
              </h2>
              {completed.map((p) => (
                <PaymentRow key={p.id} payment={p} currentUserId={user!.id} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentRow({ payment, currentUserId }: { payment: Payment; currentUserId: string }) {
  const isSender = payment.senderId === currentUserId;
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";

  const statusIcon = {
    COMPLETED: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    PENDING: <Clock className="h-4 w-4 text-amber-500" />,
    FAILED: <XCircle className="h-4 w-4 text-rose-500" />,
  }[payment.status];

  const statusVariant = {
    COMPLETED: "success" as const,
    PENDING: "warning" as const,
    FAILED: "destructive" as const,
  }[payment.status];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Direction icon */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isSender ? "bg-rose-100 dark:bg-rose-900" : "bg-emerald-100 dark:bg-emerald-900"
          }`}>
            {isSender
              ? <ArrowUpRight className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              : <ArrowDownLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            }
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {isSender
                ? `Paid ${payment.receiver.displayName}`
                : `Received from ${payment.sender.displayName}`}
            </p>
            {payment.memo && (
              <p className="text-xs text-muted-foreground truncate">{payment.memo}</p>
            )}
            <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
          </div>

          {/* Amount + status */}
          <div className="text-right shrink-0 space-y-1">
            <p className={`font-bold ${isSender ? "text-rose-500" : "text-emerald-600"}`}>
              {isSender ? "-" : "+"}{formatAmount(payment.amount, payment.currency)}
            </p>
            <Badge variant={statusVariant} className="text-xs">
              {statusIcon}
              <span className="ml-1">{payment.status}</span>
            </Badge>
          </div>
        </div>

        {/* Stellar tx hash */}
        {payment.stellarTxHash && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
              {payment.stellarTxHash}
            </span>
            <Button variant="ghost" size="sm" asChild className="h-6 text-xs gap-1">
              <a
                href={stellarExplorerUrl(payment.stellarTxHash, network)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
