// Système de rang de la saison ROTK.
// Source : relevés de rotkwiki.com/en/mechanics sur le classement officiel
// (Saison 1, Europe Solo, 2026-09-24). Les seuils non observés restent à null.

export const DIVISIONS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Royalty",
] as const;

export type Division = (typeof DIVISIONS)[number];
export type Tier = "V" | "IV" | "III" | "II" | "I";

export const TIERS: Tier[] = ["V", "IV", "III", "II", "I"];

// Points observés : une victoire vaut 175 000, un kill 1 000.
// Le score de saison additionne les 10 meilleures parties.
export const POINTS_PER_WIN = 175_000;
export const POINTS_PER_KILL = 1_000;
export const BEST_MATCHES_COUNTED = 10;

export const KNOWN_THRESHOLDS: Partial<Record<`${Division} ${Tier}`, number>> = {
  "Royalty V": 1_800_000,
  "Royalty I": 1_900_000,
};

export const DIVISION_COLORS: Record<Division, string> = {
  Bronze: "#a0673a",
  Silver: "#b9c0c8",
  Gold: "#e2b33c",
  Platinum: "#5ec4b6",
  Diamond: "#6fa8ff",
  Master: "#b06bff",
  Royalty: "#e0182d",
};

export const DIVISION_LABELS_FR: Record<Division, string> = {
  Bronze: "Bronze",
  Silver: "Argent",
  Gold: "Or",
  Platinum: "Platine",
  Diamond: "Diamant",
  Master: "Maître",
  Royalty: "Royalty",
};
