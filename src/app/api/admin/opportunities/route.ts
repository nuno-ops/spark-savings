import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/opportunities — list ALL opportunities with filters (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term } },
      { brief: { contains: term } },
      { company: { contains: term } },
    ];
  }

  // Validate sort field
  const allowedSorts = ["createdAt", "confidenceScore", "title"];
  const sortField = allowedSorts.includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      contributor: { select: { id: true, name: true, email: true } },
      _count: { select: { purchases: true, reviews: true } },
    },
    orderBy: { [sortField]: sortOrder },
  });

  return NextResponse.json(opportunities);
}
