import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PUT /api/meetings/:id — confirm or update meeting
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only participant can update
  if (
    meeting.companyId !== session.user.id &&
    meeting.contributorId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, confirmedTime } = await req.json();

  const updated = await prisma.meeting.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(confirmedTime && { confirmedTime }),
    },
  });

  return NextResponse.json(updated);
}
