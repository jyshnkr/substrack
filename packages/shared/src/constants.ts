import type { BillingCycle, SubscriptionCategory } from "./types.js";

// ─── Known Merchant Configuration ───────────────────────

export interface KnownMerchant {
  displayName: string;
  defaultBillingCycle: BillingCycle;
  category: SubscriptionCategory;
  logoUrl?: string;
  patterns: string[];
}

/**
 * Dictionary of known subscription merchants.
 * Key is the canonical normalized name (lowercase, trimmed).
 * Used by the detection engine for high-confidence matching.
 */
export const KNOWN_MERCHANTS: Record<string, KnownMerchant> = {
  // ─── Streaming ────────────────────────────────────
  netflix: {
    displayName: "Netflix",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: ["netflix", "netflix.com", "netflix inc"],
  },
  hulu: {
    displayName: "Hulu",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: ["hulu", "hulu llc", "hulu.com"],
  },
  "disney+": {
    displayName: "Disney+",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: ["disney plus", "disney+", "disneyplus", "walt disney"],
  },
  "hbo max": {
    displayName: "Max (HBO)",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: ["hbo max", "hbo", "max.com", "warner bros discovery"],
  },
  "amazon prime": {
    displayName: "Amazon Prime",
    defaultBillingCycle: "annual",
    category: "streaming",
    patterns: [
      "amazon prime",
      "amzn prime",
      "amazon.com prime",
      "prime video",
    ],
  },
  "apple tv+": {
    displayName: "Apple TV+",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: ["apple tv", "apple.com/bill tv"],
  },
  "youtube premium": {
    displayName: "YouTube Premium",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: [
      "youtube premium",
      "google youtube",
      "youtube.com",
      "google*youtube",
    ],
  },
  peacock: {
    displayName: "Peacock",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: ["peacock", "peacocktv"],
  },
  paramount: {
    displayName: "Paramount+",
    defaultBillingCycle: "monthly",
    category: "streaming",
    patterns: ["paramount+", "paramount plus", "paramountplus"],
  },

  // ─── Music ────────────────────────────────────────
  spotify: {
    displayName: "Spotify",
    defaultBillingCycle: "monthly",
    category: "music",
    patterns: ["spotify", "spotify usa", "spotify ab"],
  },
  "apple music": {
    displayName: "Apple Music",
    defaultBillingCycle: "monthly",
    category: "music",
    patterns: ["apple music", "apple.com/bill music"],
  },
  tidal: {
    displayName: "Tidal",
    defaultBillingCycle: "monthly",
    category: "music",
    patterns: ["tidal", "tidal music"],
  },

  // ─── Software / Productivity ──────────────────────
  "microsoft 365": {
    displayName: "Microsoft 365",
    defaultBillingCycle: "annual",
    category: "software",
    patterns: [
      "microsoft 365",
      "microsoft*365",
      "msft 365",
      "office 365",
      "microsoft office",
    ],
  },
  "adobe creative cloud": {
    displayName: "Adobe Creative Cloud",
    defaultBillingCycle: "monthly",
    category: "software",
    patterns: [
      "adobe creative",
      "adobe systems",
      "adobe cc",
      "adobe.com",
      "adobe*creative",
    ],
  },
  notion: {
    displayName: "Notion",
    defaultBillingCycle: "monthly",
    category: "productivity",
    patterns: ["notion", "notion labs", "notion.so"],
  },
  slack: {
    displayName: "Slack",
    defaultBillingCycle: "monthly",
    category: "productivity",
    patterns: ["slack", "slack technologies"],
  },
  "google one": {
    displayName: "Google One",
    defaultBillingCycle: "monthly",
    category: "cloud",
    patterns: ["google one", "google storage", "google*one"],
  },
  dropbox: {
    displayName: "Dropbox",
    defaultBillingCycle: "monthly",
    category: "cloud",
    patterns: ["dropbox", "dropbox inc"],
  },
  "icloud+": {
    displayName: "iCloud+",
    defaultBillingCycle: "monthly",
    category: "cloud",
    patterns: ["icloud", "apple.com/bill icloud", "apple icloud"],
  },
  "1password": {
    displayName: "1Password",
    defaultBillingCycle: "annual",
    category: "security",
    patterns: ["1password", "agilebits"],
  },

  // ─── Gaming ───────────────────────────────────────
  "xbox game pass": {
    displayName: "Xbox Game Pass",
    defaultBillingCycle: "monthly",
    category: "gaming",
    patterns: [
      "xbox game pass",
      "microsoft*xbox",
      "xbox live",
      "xbox ultimate",
    ],
  },
  "playstation plus": {
    displayName: "PlayStation Plus",
    defaultBillingCycle: "annual",
    category: "gaming",
    patterns: ["playstation plus", "sony playstation", "ps plus"],
  },
  "nintendo switch online": {
    displayName: "Nintendo Switch Online",
    defaultBillingCycle: "annual",
    category: "gaming",
    patterns: ["nintendo switch online", "nintendo", "nintendo*online"],
  },

  // ─── News / Reading ───────────────────────────────
  "new york times": {
    displayName: "New York Times",
    defaultBillingCycle: "monthly",
    category: "news",
    patterns: ["new york times", "nytimes", "nyt digital"],
  },
  "wall street journal": {
    displayName: "Wall Street Journal",
    defaultBillingCycle: "monthly",
    category: "news",
    patterns: ["wall street journal", "wsj", "dow jones"],
  },
  "washington post": {
    displayName: "Washington Post",
    defaultBillingCycle: "monthly",
    category: "news",
    patterns: ["washington post", "washingtonpost"],
  },

  // ─── Fitness ──────────────────────────────────────
  "planet fitness": {
    displayName: "Planet Fitness",
    defaultBillingCycle: "monthly",
    category: "fitness",
    patterns: ["planet fitness", "pf fitness"],
  },
  peloton: {
    displayName: "Peloton",
    defaultBillingCycle: "monthly",
    category: "fitness",
    patterns: ["peloton", "peloton interactive"],
  },

  // ─── Food ─────────────────────────────────────────
  doordash: {
    displayName: "DoorDash DashPass",
    defaultBillingCycle: "monthly",
    category: "food",
    patterns: ["doordash dashpass", "doordash*dashpass"],
  },
  "uber eats pass": {
    displayName: "Uber One",
    defaultBillingCycle: "monthly",
    category: "food",
    patterns: ["uber one", "uber eats pass", "uber*one"],
  },
};
