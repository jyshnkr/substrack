import { type BillingCycle, BillingCycle as BC } from "./types.js";
import { KNOWN_MERCHANTS } from "./constants.js";

/**
 * Normalize a merchant name for consistent matching.
 *
 * Transforms raw bank transaction merchant names into a canonical form:
 * 1. Lowercase
 * 2. Remove common corporate suffixes (Inc, LLC, Ltd, Co, Corp)
 * 3. Remove special characters except spaces, letters, numbers, +, /, *
 * 4. Collapse multiple spaces
 * 5. Trim
 */
export function normalizeMerchantName(rawName: string): string {
  if (!rawName) return "";

  let name = rawName.toLowerCase().trim();

  // Remove common corporate suffixes
  name = name.replace(
    /\b(inc\.?|llc\.?|ltd\.?|co\.?|corp\.?|corporation|incorporated|limited)\b/gi,
    ""
  );

  // Remove special characters but keep letters, numbers, spaces, +, /, *
  name = name.replace(/[^a-z0-9\s+/*]/g, "");

  // Collapse multiple spaces
  name = name.replace(/\s+/g, " ").trim();

  return name;
}

/**
 * Infer the billing cycle from a set of transaction dates.
 *
 * Analyzes the intervals between chronologically sorted transaction dates
 * and returns the most likely billing cycle based on median interval.
 *
 * Requires at least 2 dates to infer a cycle.
 */
export function inferBillingCycle(dates: Date[]): BillingCycle {
  if (dates.length < 2) return BC.UNKNOWN;

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i]!.getTime() - sorted[i - 1]!.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    intervals.push(diffDays);
  }

  // Use median interval (more robust against outliers than mean)
  const sortedIntervals = [...intervals].sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedIntervals.length / 2);
  const median = sortedIntervals[medianIndex]!;

  if (median >= 5 && median <= 10) return BC.WEEKLY;
  if (median >= 25 && median <= 35) return BC.MONTHLY;
  if (median >= 80 && median <= 100) return BC.QUARTERLY;
  if (median >= 160 && median <= 200) return BC.SEMI_ANNUAL;
  if (median >= 350 && median <= 380) return BC.ANNUAL;

  return BC.UNKNOWN;
}

/**
 * Look up a normalized merchant name in the KNOWN_MERCHANTS dictionary.
 * Returns the matching merchant key and data, or null if not found.
 *
 * Matching strategy:
 * 1. Direct key match (exact)
 * 2. Pattern substring match (checks if normalizedName contains any pattern)
 */
export function findKnownMerchant(
  normalizedName: string
): { key: string; merchant: (typeof KNOWN_MERCHANTS)[string] } | null {
  if (normalizedName in KNOWN_MERCHANTS) {
    return { key: normalizedName, merchant: KNOWN_MERCHANTS[normalizedName]! };
  }

  for (const [key, merchant] of Object.entries(KNOWN_MERCHANTS)) {
    for (const pattern of merchant.patterns) {
      if (
        normalizedName.includes(pattern) ||
        pattern.includes(normalizedName)
      ) {
        return { key, merchant };
      }
    }
  }

  return null;
}
