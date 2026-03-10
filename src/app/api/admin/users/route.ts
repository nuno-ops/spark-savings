import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/users — list all users with activity summaries (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const suspended = searchParams.get("suspended");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (role && role !== "all") where.role = role;
  if (suspended === "true") where.suspended = true;
  if (suspended === "false") where.suspended = false;
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term } },
      { email: { contains: term } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      suspended: true,
      createdAt: true,
      _count: {
        select: {
          opportunities: true,
          purchases: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
