"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus, Users, ArrowLeft, ExternalLink, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseCard } from "@/components/expense-card";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { PaymentDialog } from "@/components/payment-dialog";
import { useAppStore } from "@/store/app-store";
import { formatAmount, calculateSettlements, stellarExplorerUrl } from "@/lib/utils";
import type { Group, Settlement } from "@/types";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAppStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Settlement | null>(null);

  const fetchGroup = async () => {
    const res = await fetch(`/api/groups/${id}`);
    if (!res.ok) { router.push("/groups"); return; }
    const data = await res.json();
    setGroup(data.group);
  };

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetchGroup().finally(() => setIsLoading(false));
  }, [id, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!group || !user) return null;

  // Calculate balances for this group
  const balanceMap = new Map<string, { userId: string; displayName: string; net: number }>();

  // Initialize all members
  group.members.forEach((m) => {
    balanceMap.set(m.userId, { userId: m.userId, displayName: m.user.displayName, net: 0 });
  });

  // Process each expense
  group.expenses.forEach((expense) => {
    expense.shares.forEach((share) => {
      if (share.paid || share.userId === expense.payerId) return;
      // Debtor owes payer
      const debtor = balanceMap.get(share.userId);
      const creditor = balanceMap.get(expense.payerId);
      if (debtor) debtor.net -= share.amount;
      if (creditor) creditor.net += share.amount;
    });
  });

  const balances = Array.from(balanceMap.values());
  const settlements = calculateSettlements(balances);
  const myBalance = balanceMap.get(user.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{group.name}</h1>
            <Badge variant="outline">{group.currency}</Badge>
          </div>
          {group.description && (
            <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setAddMemberOpen(true)} className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setAddExpenseOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: expenses */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg">Expenses</h2>
          {group.expenses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-muted-foreground">No expenses yet</p>
                <Button variant="gradient" size="sm" onClick={() => setAddExpenseOpen(true)} className="gap-1">
                  <Plus className="h-4 w-4" /> Add first expense
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {group.expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} currentUserId={user.id} />
              ))}
            </div>
          )}
        </div>

        {/* Right: balances + settlements */}
        <div className="space-y-4">
          {/* My balance */}
          {myBalance && (
            <Card className={`border-2 ${
              myBalance.net > 0 ? "border-emerald-200 dark:border-emerald-800" :
              myBalance.net < 0 ? "border-rose-200 dark:border-rose-800" : ""
            }`}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Your balance</p>
                <p className={`text-2xl font-bold mt-1 ${
                  myBalance.net > 0 ? "text-emerald-600" :
                  myBalance.net < 0 ? "text-rose-500" : ""
                }`}>
                  {myBalance.net > 0 ? "+" : ""}{formatAmount(myBalance.net, group.currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {myBalance.net > 0 ? "You are owed" : myBalance.net < 0 ? "You owe" : "All settled!"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Members */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Members ({group.members.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {group.members.map((member) => {
                const bal = balanceMap.get(member.userId);
                return (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {member.userId === user.id ? "You" : member.user.displayName}
                    </span>
                    {bal && (
                      <span className={`text-xs ${
                        bal.net > 0 ? "text-emerald-600" :
                        bal.net < 0 ? "text-rose-500" : "text-muted-foreground"
                      }`}>
                        {bal.net > 0 ? "+" : ""}{formatAmount(bal.net, group.currency)}
                      </span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Settlements */}
          {settlements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Suggested Settlements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {settlements.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        <span className="font-medium">
                          {s.fromUserId === user.id ? "You" : s.fromName}
                        </span>
                        {" → "}
                        <span className="font-medium">
                          {s.toUserId === user.id ? "You" : s.toName}
                        </span>
                      </span>
                      <span className="font-semibold">{formatAmount(s.amount, group.currency)}</span>
                    </div>
                    {s.fromUserId === user.id && (
                      <Button
                        size="sm"
                        variant="gradient"
                        className="w-full h-7 text-xs"
                        onClick={() => setPaymentTarget(s)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {settlements.length === 0 && group.expenses.length > 0 && (
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">All settled up!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddExpenseDialog
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        group={group}
        currentUserId={user.id}
        onAdded={fetchGroup}
      />
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        groupId={group.id}
        existingMemberIds={group.members.map((m) => m.userId)}
        onAdded={fetchGroup}
      />
      {paymentTarget && (
        <PaymentDialog
          open={!!paymentTarget}
          onOpenChange={(open) => !open && setPaymentTarget(null)}
          settlement={paymentTarget}
          currency={group.currency}
          groupId={group.id}
          onPaid={fetchGroup}
        />
      )}
    </div>
  );
}
