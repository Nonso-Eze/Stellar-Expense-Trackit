import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/groups — list all groups for the current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: {
          owner: true,
          members: { include: { user: true } },
          _count: { select: { expenses: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const groups = memberships.map((m) => ({
    ...m.group,
    expenses: [], // Don't load full expenses in list view
  }));

  return NextResponse.json({ groups });
}

// POST /api/groups — create a new group
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, currency } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      currency: currency ?? "XLM",
      ownerId: user.id,
      members: {
        create: [{ userId: user.id }], // Creator is automatically a member
      },
    },
    include: {
      owner: true,
      members: { include: { user: true } },
    },
  });

  return NextResponse.json({ group }, { status: 201 });
}
