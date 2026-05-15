import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/groups/[id]/expenses — add an expense to a group
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;
  const { title, amount, payerId, splitType = "EQUAL" } = await req.json();

  if (!title || !amount || !payerId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify user is a member
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  // Get all group members for splitting
  const members = await prisma.groupMember.findMany({ where: { groupId } });
  const perPerson = parseFloat((amount / members.length).toFixed(7));

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  const expense = await prisma.expense.create({
    data: {
      title: title.trim(),
      amount: parseFloat(amount),
      currency: group?.currency ?? "XLM",
      splitType,
      groupId,
      payerId,
      shares: {
        create: members.map((m) => ({
          userId: m.userId,
          amount: perPerson,
          // Payer's own share is considered paid
          paid: m.userId === payerId,
        })),
      },
    },
    include: {
      payer: true,
      shares: { include: { user: true } },
    },
  });

  return NextResponse.json({ expense }, { status: 201 });
}
