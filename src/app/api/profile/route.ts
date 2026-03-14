import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizeText, MAX_LENGTHS } from "@/lib/validation";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { companyName } = await req.json();

    if (companyName !== undefined && companyName !== null) {
      // Allow clearing the field
      if (typeof companyName === "string" && companyName.trim() === "") {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { companyName: null },
        });
      } else if (
        typeof companyName === "string" &&
        companyName.trim().length <= MAX_LENGTHS.company
      ) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { companyName: sanitizeText(companyName.trim()) },
        });
      } else {
        return NextResponse.json(
          { error: "Invalid company name" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyName: true },
  });

  return NextResponse.json({ companyName: user?.companyName || "" });
}
