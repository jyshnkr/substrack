import { describe, expect, it } from "vitest";
import {
  normalizeMerchantName,
  inferBillingCycle,
  findKnownMerchant,
} from "../utils.js";

describe("normalizeMerchantName", () => {
  it("lowercases and trims", () => {
    expect(normalizeMerchantName("  NETFLIX  ")).toBe("netflix");
  });

  it("removes corporate suffixes", () => {
    expect(normalizeMerchantName("Spotify USA Inc")).toBe("spotify usa");
    expect(normalizeMerchantName("HULU, LLC.")).toBe("hulu");
  });

  it("preserves slashes and asterisks", () => {
    expect(normalizeMerchantName("APPLE.COM/BILL")).toBe("applecom/bill");
    expect(normalizeMerchantName("GOOGLE*YOUTUBE")).toBe("google*youtube");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeMerchantName("HBO   MAX")).toBe("hbo max");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeMerchantName("")).toBe("");
  });
});

describe("inferBillingCycle", () => {
  const makeDate = (daysFromStart: number) =>
    new Date(2025, 0, 1 + daysFromStart);

  it("returns unknown for fewer than 2 dates", () => {
    expect(inferBillingCycle([])).toBe("unknown");
    expect(inferBillingCycle([new Date()])).toBe("unknown");
  });

  it("detects monthly billing", () => {
    const dates = [makeDate(0), makeDate(30), makeDate(61), makeDate(91)];
    expect(inferBillingCycle(dates)).toBe("monthly");
  });

  it("detects annual billing", () => {
    const dates = [makeDate(0), makeDate(365), makeDate(730)];
    expect(inferBillingCycle(dates)).toBe("annual");
  });

  it("detects weekly billing", () => {
    const dates = [makeDate(0), makeDate(7), makeDate(14), makeDate(21)];
    expect(inferBillingCycle(dates)).toBe("weekly");
  });

  it("detects quarterly billing", () => {
    const dates = [makeDate(0), makeDate(90), makeDate(180)];
    expect(inferBillingCycle(dates)).toBe("quarterly");
  });

  it("returns unknown for irregular intervals", () => {
    const dates = [makeDate(0), makeDate(15), makeDate(45), makeDate(50)];
    expect(inferBillingCycle(dates)).toBe("unknown");
  });
});

describe("findKnownMerchant", () => {
  it("finds by exact key match", () => {
    const result = findKnownMerchant("netflix");
    expect(result).not.toBeNull();
    expect(result!.merchant.displayName).toBe("Netflix");
  });

  it("finds by pattern substring match", () => {
    const result = findKnownMerchant("netflix inc");
    expect(result).not.toBeNull();
    expect(result!.merchant.displayName).toBe("Netflix");
  });

  it("returns null for unknown merchant", () => {
    const result = findKnownMerchant("random unknown store");
    expect(result).toBeNull();
  });
});
