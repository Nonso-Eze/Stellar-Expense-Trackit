import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, displayName } = await req.json();

    if (!username || !displayName) {
      return NextResponse.json({ error: "Username and display name are required" }, { status: 400 });
    }

    const clean = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username: clean } });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { username: clean, displayName: displayName.trim() },
    });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
