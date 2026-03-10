import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";

// POST /api/auth/forgot-password — request a password reset link
export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = getClientIp(req);
  const limited = rateLimit(`forgot-password:${ip}`, RATE_LIMITS.passwordReset);
  if (limited) return limited;

  try {
    const { email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    // Always return success to avoid revealing whether the email exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      // Generate a cryptographically secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordReset.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      // Build the reset URL
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

      // Send the email (gracefully handles missing RESEND_API_KEY)
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    // Always return the same response regardless of whether the user exists
    return NextResponse.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
