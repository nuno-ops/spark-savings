/**
 * Input validation helpers for API routes.
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate a UUID string */
export function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/** Validate an email address (basic format check) */
export function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    EMAIL_REGEX.test(value)
  );
}

/** Validate a string with length constraints */
export function isValidString(
  value: unknown,
  opts: { min?: number; max?: number } = {}
): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (opts.min !== undefined && trimmed.length < opts.min) return false;
  if (opts.max !== undefined && trimmed.length > opts.max) return false;
  return true;
}

/** Validate password strength */
export function isStrongPassword(password: string): {
  valid: boolean;
  reason?: string;
} {
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, reason: "Password must be at most 128 characters" };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      reason: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      reason: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      reason: "Password must contain at least one number",
    };
  }
  return { valid: true };
}

/** Validate an integer within range */
export function isValidInt(
  value: unknown,
  opts: { min?: number; max?: number } = {}
): value is number {
  if (typeof value !== "number" || !Number.isInteger(value)) return false;
  if (opts.min !== undefined && value < opts.min) return false;
  if (opts.max !== undefined && value > opts.max) return false;
  return true;
}

/**
 * Sanitize user input text: trim, collapse whitespace, strip HTML tags.
 * Does NOT strip markdown — only dangerous HTML.
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/<script[\s\S]*?<\/script>/gi, "") // strip script tags
    .replace(/<style[\s\S]*?<\/style>/gi, "") // strip style tags
    .replace(
      /on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
      ""
    ) // strip event handlers
    .replace(/<iframe[\s\S]*?(<\/iframe>|\/?>)/gi, "") // strip iframes
    .replace(/<object[\s\S]*?(<\/object>|\/?>)/gi, "") // strip object tags
    .replace(/<embed[\s\S]*?\/?>|<\/embed>/gi, "") // strip embed tags
    .replace(/<link[\s\S]*?\/?>|<\/link>/gi, ""); // strip link tags
}

/** Field length limits for common fields */
export const MAX_LENGTHS = {
  title: 200,
  brief: 1000,
  comment: 5000,
  message: 10000,
  markdown: 50000, // playbook, templates, checklist, etc.
  name: 100,
  email: 254,
  password: 128,
  search: 200,
  category: 50,
  company: 200,
  description: 5000,
  proposalSummary: 2000,
  proposalApproach: 10000,
} as const;
