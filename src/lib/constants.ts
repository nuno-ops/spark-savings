export const PLATFORM_FEE_PERCENT = parseInt(
  process.env.PLATFORM_FEE_PERCENT || "15",
  10
);

export const STAGE1_PRICES = [250, 500] as const;

export const CATEGORIES = [
  "general",
  "energy",
  "procurement",
  "logistics",
  "technology",
  "operations",
  "finance",
  "hr",
  "marketing",
  "compliance",
] as const;

export const REFUND_WINDOW_HOURS = 48;

export const REQUEST_STATUSES = ["open", "closed", "suspended"] as const;
export const PROPOSAL_STATUSES = ["pending", "accepted", "rejected"] as const;

// Confidential-leak keywords to flag
export const CONFIDENTIAL_KEYWORDS = [
  "nda",
  "non-disclosure",
  "internal deck",
  "invoice attached",
  "customer list",
  "confidential",
  "proprietary",
  "trade secret",
  "classified",
  "restricted distribution",
  "internal only",
  "do not share",
];

// PII regex patterns
export const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // email
  /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/, // phone
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
  /\b\d{2}[-/]\d{2}[-/]\d{4}\b/, // date of birth pattern
];
