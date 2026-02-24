import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/contributor/opportunities — list current contributor's own opportunities
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { contributorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(opportunities);
}
