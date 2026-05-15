import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/payments — list all payments for the current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}

// POST /api/payments — record a new payment
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, currency, receiverId, stellarTxHash, memo } = await req.json();

  if (!amount || !receiverId) {
    return NextResponse.json({ error: "amount and receiverId are required" }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      amount: parseFloat(amount),
      currency: currency ?? "XLM",
      status: stellarTxHash ? "COMPLETED" : "PENDING",
      stellarTxHash: stellarTxHash ?? null,
      memo: memo ?? null,
      senderId: user.id,
      receiverId,
      completedAt: stellarTxHash ? new Date() : null,
    },
    include: { sender: true, receiver: true },
  });

  return NextResponse.json({ payment }, { status: 201 });
}
