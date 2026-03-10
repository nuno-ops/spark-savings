import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidString, isValidInt, sanitizeText, MAX_LENGTHS } from "@/lib/validation";

// GET /api/requests — list company requests (public: open only, mine=true: all for owner)
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`requests-list:${ip}`, RATE_LIMITS.read);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const mine = searchParams.get("mine");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // "mine=true" returns the authenticated user's own requests (all statuses)
  if (mine === "true") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    where.companyId = session.user.id;
  } else {
    // Public: only open requests
    where.status = "open";
  }

  if (category && category !== "all") {
    if (CATEGORIES.includes(category as typeof CATEGORIES[number])) {
      where.category = category;
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
    take: 100,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      budgetLow: true,
      budgetHigh: true,
      status: true,
      createdAt: true,
      company: { select: { name: true } },
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Flatten _count for easier frontend consumption
  const mapped = requests.map((r) => ({
    ...r,
    proposalCount: r._count.proposals,
  }));

  return NextResponse.json(mapped);
}

// POST /api/requests — create a new request (company only)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`requests-create:${ip}`, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "company") {
    return NextResponse.json({ error: "Only companies can post requests" }, { status: 403 });
  }
  if (user.suspended) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, category, budgetLow, budgetHigh } = body;

  if (!title || !isValidString(title, { min: 1, max: MAX_LENGTHS.title })) {
    return NextResponse.json({ error: `Title must be 1-${MAX_LENGTHS.title} characters` }, { status: 400 });
  }
  if (!description || !isValidString(description, { min: 1, max: MAX_LENGTHS.description })) {
    return NextResponse.json({ error: `Description must be 1-${MAX_LENGTHS.description} characters` }, { status: 400 });
  }
  if (category && !CATEGORIES.includes(category as typeof CATEGORIES[number])) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (budgetLow !== undefined && budgetLow !== null) {
    if (!isValidInt(budgetLow, { min: 0, max: 10000000 })) {
      return NextResponse.json({ error: "Invalid budget low value" }, { status: 400 });
    }
  }
  if (budgetHigh !== undefined && budgetHigh !== null) {
    if (!isValidInt(budgetHigh, { min: 0, max: 10000000 })) {
      return NextResponse.json({ error: "Invalid budget high value" }, { status: 400 });
    }
  }
  if (budgetLow && budgetHigh && budgetHigh < budgetLow) {
    return NextResponse.json({ error: "Budget high must be >= budget low" }, { status: 400 });
  }

  const request = await prisma.companyRequest.create({
    data: {
      companyId: session.user.id,
      title: sanitizeText(title),
      description: sanitizeText(description),
      category: category || "general",
      budgetLow: budgetLow || null,
      budgetHigh: budgetHigh || null,
      status: "open",
    },
  });

  return NextResponse.json(request, { status: 201 });
}
