import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { submitTransaction } from "@/lib/stellar";

export const dynamic = "force-dynamic";

// POST /api/stellar/submit — submit a signed transaction to the Stellar network
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { signedXDR } = await req.json();

  if (!signedXDR) {
    return NextResponse.json({ error: "signedXDR is required" }, { status: 400 });
  }

  try {
    const hash = await submitTransaction(signedXDR);
    return NextResponse.json({ hash });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transaction submission failed";
    console.error("[stellar/submit]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
