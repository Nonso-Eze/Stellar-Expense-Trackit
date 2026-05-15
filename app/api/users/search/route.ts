import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/users/search — search users by username or display name
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } }, // Exclude self
        {
          OR: [
            { username: { contains: q.toLowerCase() } },
            { displayName: { contains: q } },
          ],
        },
      ],
    },
    select: { id: true, username: true, displayName: true, stellarAddress: true, createdAt: true },
    take: 10,
  });

  return NextResponse.json({ users });
}
