import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all groups the user is a member of
  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: {
          owner: true,
          members: { include: { user: true } },
          expenses: {
            include: {
              payer: true,
              shares: { include: { user: true } },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const groups = memberships.map((m) => m.group);

  // Calculate total owed and owing
  let totalOwed = 0;
  let totalOwing = 0;
  let pendingCount = 0;

  for (const group of groups) {
    for (const expense of group.expenses) {
      for (const share of expense.shares) {
        if (share.paid) continue;
        if (share.userId === expense.payerId) continue;

        if (expense.payerId === user.id && share.userId !== user.id) {
          totalOwed += share.amount;
          pendingCount++;
        } else if (share.userId === user.id) {
          totalOwing += share.amount;
        }
      }
    }
  }

  return NextResponse.json({ groups, totalOwed, totalOwing, pendingCount });
}
