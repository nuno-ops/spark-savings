import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// GET /api/api-keys — list current user's API keys
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      keyPrefix: true,
      name: true,
      revoked: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

// POST /api/api-keys — create a new API key
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "contributor") {
    return NextResponse.json(
      { error: "Only contributors can create API keys" },
      { status: 403 }
    );
  }

  const { name } = await req.json();

  // Generate a raw key like "spark_xxxxxxxxxxxx"
  const rawKey = `spark_${uuidv4().replace(/-/g, "")}`;
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.substring(0, 12);

  await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      keyHash,
      keyPrefix,
      name: name || "Default",
    },
  });

  // Return the raw key ONCE — user must save it
  return NextResponse.json(
    { key: rawKey, prefix: keyPrefix, name: name || "Default" },
    { status: 201 }
  );
}

// DELETE /api/api-keys — revoke an API key
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  const key = await prisma.apiKey.findUnique({ where: { id } });
  if (!key || key.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id },
    data: { revoked: true },
  });

  return NextResponse.json({ success: true });
}
