import { CONFIDENTIAL_KEYWORDS, PII_PATTERNS } from "./constants";
import { prisma } from "./db";

/**
 * AI Triage: runs on every new opportunity submission.
 * Returns scoring info and flags.
 */
export interface TriageResult {
  confidenceScore: number;
  piiDetected: boolean;
  flagReason: string | null;
  duplicateOfId: string | null;
}

export async function triageOpportunity(
  title: string,
  brief: string,
  allText: string // concatenation of all text fields
): Promise<TriageResult> {
  let confidenceScore = 50; // start at 50/100
  let piiDetected = false;
  let flagReason: string | null = null;
  let duplicateOfId: string | null = null;

  // ── 1. PII detection ──────────────────────────────────
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(allText)) {
      piiDetected = true;
      flagReason = "PII detected in submission";
      confidenceScore -= 20;
      break;
    }
  }

  // ── 2. Confidential keyword detection ─────────────────
  const lowerText = allText.toLowerCase();
  const foundKeywords: string[] = [];
  for (const kw of CONFIDENTIAL_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase())) {
      foundKeywords.push(kw);
    }
  }
  if (foundKeywords.length > 0) {
    flagReason =
      (flagReason ? flagReason + "; " : "") +
      `Confidential keywords found: ${foundKeywords.join(", ")}`;
    confidenceScore -= 15;
  }

  // ── 3. Basic quality scoring ──────────────────────────
  // Reward longer, more detailed submissions
  if (brief.length > 100) confidenceScore += 10;
  if (brief.length > 300) confidenceScore += 10;
  if (allText.length > 500) confidenceScore += 10;

  // ── 4. Simple duplicate detection ─────────────────────
  // Check title similarity against existing published opportunities
  const existing = await prisma.opportunity.findMany({
    where: { status: "published" },
    select: { id: true, title: true },
  });

  for (const opp of existing) {
    const similarity = jaccardSimilarity(
      title.toLowerCase(),
      opp.title.toLowerCase()
    );
    if (similarity > 0.6) {
      duplicateOfId = opp.id;
      flagReason =
        (flagReason ? flagReason + "; " : "") +
        `Possible duplicate of "${opp.title}"`;
      confidenceScore -= 10;
      break;
    }
  }

  // Clamp score
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  return { confidenceScore, piiDetected, flagReason, duplicateOfId };
}

/** Simple Jaccard similarity on word sets */
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}
