"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  existingMemberIds: string[];
  onAdded: () => void;
}

export function AddMemberDialog({ open, onOpenChange, groupId, existingMemberIds, onAdded }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults((data.users ?? []).filter((u: UserProfile) => !existingMemberIds.includes(u.id)));
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (userId: string) => {
    setIsAdding(userId);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Failed to add member", description: data.error, variant: "destructive" });
        return;
      }

      toast({ title: "Member added!" });
      onAdded();
      setResults((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search by username</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. bob"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(user.id)}
                    disabled={isAdding === user.id}
                  >
                    {isAdding === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && search && !isSearching && (
            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
