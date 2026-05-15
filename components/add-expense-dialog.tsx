"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { Group } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  currentUserId: string;
  onAdded: () => void;
}

export function AddExpenseDialog({ open, onOpenChange, group, currentUserId, onAdded }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(currentUserId);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          amount: parsedAmount,
          payerId,
          splitType: "EQUAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Failed to add expense", description: data.error, variant: "destructive" });
        return;
      }

      toast({ title: "Expense added!", description: `${title} — ${parsedAmount} ${group.currency}` });
      onAdded();
      onOpenChange(false);
      setTitle("");
      setAmount("");
      setPayerId(currentUserId);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const perPerson = amount && !isNaN(parseFloat(amount))
    ? (parseFloat(amount) / group.members.length).toFixed(2)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add expense to {group.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-title">What was it for?</Label>
            <Input
              id="expense-title"
              placeholder="e.g. Dinner at Nobu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-amount">Total amount ({group.currency})</Label>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {perPerson && (
              <p className="text-xs text-muted-foreground">
                Split equally: {perPerson} {group.currency} per person ({group.members.length} people)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Paid by</Label>
            <div className="grid grid-cols-2 gap-2">
              {group.members.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setPayerId(m.userId)}
                  className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                    payerId === m.userId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {m.userId === currentUserId ? "You" : m.user.displayName}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
