"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Users, TrendingUp, TrendingDown, Clock, ArrowRight, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { formatAmount, formatDate } from "@/lib/utils";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { DashboardSkeleton } from "@/components/skeletons";
import type { Group } from "@/types";

interface DashboardData {
  groups: Group[];
  totalOwed: number;
  totalOwing: number;
  pendingCount: number;
  currency: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) return null;
  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.displayName}</p>
        </div>
        <Button variant="gradient" onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Group
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="You are owed"
          value={formatAmount(data?.totalOwed ?? 0)}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          color="emerald"
        />
        <SummaryCard
          title="You owe"
          value={formatAmount(data?.totalOwing ?? 0)}
          icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
          color="rose"
        />
        <SummaryCard
          title="Active groups"
          value={String(data?.groups.length ?? 0)}
          icon={<Users className="h-5 w-5 text-violet-500" />}
          color="violet"
        />
        <SummaryCard
          title="Pending payments"
          value={String(data?.pendingCount ?? 0)}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
      </div>

      {/* Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups" className="gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {!data?.groups.length ? (
          <EmptyGroups onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.groups.slice(0, 6).map((group) => (
              <GroupCard key={group.id} group={group} currentUserId={user.id} />
            ))}
          </div>
        )}
      </div>

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(group) => {
          router.push(`/groups/${group.id}`);
        }}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function GroupCard({ group, currentUserId }: { group: Group; currentUserId: string }) {
  const memberCount = group.members.length;
  const expenseCount = group.expenses?.length ?? 0;

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 text-white font-bold text-lg">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <Badge variant="outline" className="text-xs">
              {group.currency}
            </Badge>
          </div>
          <CardTitle className="text-base mt-2 line-clamp-1">{group.name}</CardTitle>
          {group.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{group.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
            <span>{expenseCount} expense{expenseCount !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{formatDate(group.createdAt)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyGroups({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">No groups yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a group to start splitting expenses with friends
          </p>
        </div>
        <Button onClick={onCreateClick} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          Create your first group
        </Button>
      </CardContent>
    </Card>
  );
}
