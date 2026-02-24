import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/admin/suspend — suspend/unsuspend a user or opportunity
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { type, id, suspend } = await req.json();

  if (!type || !id || typeof suspend !== "boolean") {
    return NextResponse.json(
      { error: "type (user|opportunity), id, and suspend (boolean) required" },
      { status: 400 }
    );
  }

  if (type === "user") {
    await prisma.user.update({
      where: { id },
      data: { suspended: suspend },
    });
    return NextResponse.json({ success: true });
  }

  if (type === "opportunity") {
    await prisma.opportunity.update({
      where: { id },
      data: { status: suspend ? "suspended" : "draft" },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
