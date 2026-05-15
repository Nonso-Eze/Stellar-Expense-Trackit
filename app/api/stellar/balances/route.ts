import { NextRequest, NextResponse } from "next/server";
import { getAccountBalances } from "@/lib/stellar";

// Force dynamic — prevents Next.js from trying to statically render this route
export const dynamic = "force-dynamic";

// GET /api/stellar/balances?address=G... — fetch XLM and USDC balances
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  const balances = await getAccountBalances(address);
  return NextResponse.json(balances);
}
