import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/groups/[id]/members — add a member to a group
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  // Only group owner can add members
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the group owner can add members" }, { status: 403 });
  }

  // Check user exists
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Check not already a member
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  const member = await prisma.groupMember.create({
    data: { groupId, userId },
    include: { user: true },
  });

  return NextResponse.json({ member }, { status: 201 });
}
