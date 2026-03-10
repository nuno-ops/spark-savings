import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { REQUEST_STATUSES } from "@/lib/constants";
import { MAX_LENGTHS } from "@/lib/validation";

// GET /api/admin/requests — list all company requests (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (statusFilter && statusFilter !== "all") {
    if (REQUEST_STATUSES.includes(statusFilter as typeof REQUEST_STATUSES[number])) {
      where.status = statusFilter;
    }
  }

  if (search && search.trim()) {
    const term = search.trim().slice(0, MAX_LENGTHS.search);
    where.OR = [
      { title: { contains: term } },
      { description: { contains: term } },
    ];
  }

  const requests = await prisma.companyRequest.findMany({
    where,
    include: {
      company: { select: { id: true, name: true, email: true } },
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(requests);
}
