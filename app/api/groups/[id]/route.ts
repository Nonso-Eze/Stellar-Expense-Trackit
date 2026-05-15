import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic"; — get a single group with all details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify user is a member
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      owner: true,
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      expenses: {
        include: {
          payer: true,
          shares: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  return NextResponse.json({ group });
}
