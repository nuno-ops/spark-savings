import { Resend } from "resend";

// Resend client — initialised lazily so the app boots even without the key
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// ─── From address ────────────────────────────────────────────
const FROM =
  process.env.EMAIL_FROM || "Spark Savings <noreply@sparksavings.com>";

// ─── Password Reset Email ────────────────────────────────────
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  const client = getResend();

  if (!client) {
    // No API key configured — log in dev, warn in prod
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Password reset email for ${to}: ${resetUrl}`);
    } else {
      console.warn(
        "[EMAIL] RESEND_API_KEY not configured — password reset email not sent"
      );
    }
    return false;
  }

  try {
    await client.emails.send({
      from: FROM,
      to,
      subject: "Reset your Spark Savings password",
      html: passwordResetHtml(resetUrl),
    });
    return true;
  } catch (err) {
    console.error("[EMAIL] Failed to send password reset email:", err);
    return false;
  }
}

// ─── HTML template ───────────────────────────────────────────
function passwordResetHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:24px 32px;text-align:center;">
          <span style="color:#34d399;font-size:20px;font-weight:700;">⚡ Spark Savings</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
            We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 24px;">
              <a href="${resetUrl}" style="display:inline-block;background:#059669;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                Reset Password
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">If you didn't request this, you can safely ignore this email.</p>
          <p style="margin:0;font-size:12px;color:#cbd5e1;word-break:break-all;">
            ${resetUrl}
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            &copy; ${new Date().getFullYear()} Spark Savings. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}
