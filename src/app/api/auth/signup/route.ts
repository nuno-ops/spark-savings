import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import {
  isValidEmail,
  isValidString,
  isStrongPassword,
  sanitizeText,
  MAX_LENGTHS,
} from "@/lib/validation";

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = getClientIp(req);
  const limited = rateLimit(`signup:${ip}`, RATE_LIMITS.signup);
  if (limited) return limited;

  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!isValidString(name, { min: 1, max: MAX_LENGTHS.name })) {
      return NextResponse.json(
        { error: `Name must be between 1 and ${MAX_LENGTHS.name} characters` },
        { status: 400 }
      );
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.reason },
        { status: 400 }
      );
    }

    if (!["contributor", "company"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be 'contributor' or 'company'" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sanitizedName = sanitizeText(name);

    const user = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), name: sanitizedName, passwordHash, role },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
