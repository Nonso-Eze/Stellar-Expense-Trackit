import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildXLMPaymentTx, buildUSDCPaymentTx } from "@/lib/stellar";

// POST /api/stellar/build-payment — build an unsigned payment transaction
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { senderAddress, receiverUserId, amount, currency, memo } = await req.json();

  if (!senderAddress || !receiverUserId || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Look up the receiver's Stellar address
  const receiver = await prisma.user.findUnique({ where: { id: receiverUserId } });
  if (!receiver?.stellarAddress) {
    return NextResponse.json(
      { error: "Recipient has not connected a Stellar wallet" },
      { status: 400 }
    );
  }

  try {
    let xdr: string;

    if (currency === "USDC") {
      xdr = await buildUSDCPaymentTx(senderAddress, receiver.stellarAddress, amount, memo);
    } else {
      xdr = await buildXLMPaymentTx(senderAddress, receiver.stellarAddress, amount, memo);
    }

    return NextResponse.json({ xdr });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to build transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
