"use client";

import { Receipt, User, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAmount, formatDate } from "@/lib/utils";
import type { Expense } from "@/types";

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
}

export function ExpenseCard({ expense, currentUserId }: ExpenseCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Find the current user's share
  const myShare = expense.shares.find((s) => s.userId === currentUserId);
  const isPayer = expense.payerId === currentUserId;
  const allPaid = expense.shares.every((s) => s.paid);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Icon + title */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{expense.title}</p>
              {expense.description && (
                <p className="text-xs text-muted-foreground truncate">{expense.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  Paid by {isPayer ? "you" : expense.payer.displayName}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(expense.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount + status */}
          <div className="text-right shrink-0">
            <p className="font-bold text-lg">{formatAmount(expense.amount, expense.currency)}</p>
            {myShare && !isPayer && (
              <p className={`text-sm ${myShare.paid ? "text-emerald-600" : "text-rose-500"}`}>
                {myShare.paid ? "✓ Paid" : `You owe ${formatAmount(myShare.amount, expense.currency)}`}
              </p>
            )}
            {isPayer && (
              <Badge variant={allPaid ? "success" : "warning"} className="text-xs">
                {allPaid ? "Settled" : "Pending"}
              </Badge>
            )}
          </div>
        </div>

        {/* Expand/collapse shares */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-xs text-muted-foreground h-7"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3 mr-1" /> Hide splits</>
          ) : (
            <><ChevronDown className="h-3 w-3 mr-1" /> Show splits ({expense.shares.length} people)</>
          )}
        </Button>

        {expanded && (
          <div className="mt-2 space-y-1 border-t pt-2">
            {expense.shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {share.userId === currentUserId ? "You" : share.user.displayName}
                </span>
                <div className="flex items-center gap-2">
                  <span>{formatAmount(share.amount, expense.currency)}</span>
                  <Badge variant={share.paid ? "success" : "outline"} className="text-xs py-0">
                    {share.paid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
