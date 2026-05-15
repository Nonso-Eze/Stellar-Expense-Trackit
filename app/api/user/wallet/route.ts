import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/user/wallet — update the user's Stellar wallet address
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stellarAddress } = await req.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { stellarAddress: stellarAddress ?? null },
  });

  return NextResponse.json({ user: updated });
}
