/**
 * Fuzzy company name matching — zero external dependencies.
 *
 * Normalises both strings (lowercase, strip legal suffixes, remove
 * punctuation) then computes a Jaccard-like word-overlap score.
 *
 * Using `min` as the denominator means short names like "Acme" still
 * match longer variants like "Acme Corporation" perfectly.
 */

const STRIP_SUFFIXES = new Set([
  "inc",
  "inc.",
  "corp",
  "corporation",
  "ltd",
  "limited",
  "llc",
  "gmbh",
  "co",
  "company",
  "group",
  "plc",
  "ag",
  "sa",
  "srl",
  "bv",
  "nv",
  "pty",
  "pvt",
  "se",
]);

function normalizeCompanyTokens(name: string): Set<string> {
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // replace punctuation with spaces
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STRIP_SUFFIXES.has(t));
  return new Set(tokens);
}

/**
 * Returns a match score between 0 and 1.
 * Score >= MATCH_THRESHOLD is considered a match.
 */
export function companyMatchScore(
  opportunityCompany: string,
  userCompanyName: string
): number {
  if (!opportunityCompany || !userCompanyName) return 0;

  const tokensA = normalizeCompanyTokens(opportunityCompany);
  const tokensB = normalizeCompanyTokens(userCompanyName);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }

  // Use min denominator so "Acme" matches "Acme Corp" perfectly
  return intersection / Math.min(tokensA.size, tokensB.size);
}

export const MATCH_THRESHOLD = 0.5;
