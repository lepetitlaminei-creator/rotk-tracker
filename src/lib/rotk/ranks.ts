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

// Barème affiché sur rotk.app/leaderboard : victoire 175 000, kill (solo) ou
// kill d'équipe 1 000, assist d'équipe (hors solo) 250.
// Le score de saison additionne les 10 meilleures parties.
export const POINTS_PER_WIN = 175_000;
export const POINTS_PER_KILL = 1_000;
export const POINTS_PER_ASSIST = 250;
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

// Badge renvoyé par l'API : tier 0 = non classé, 1..7 = Bronze..Royalty ;
// subtier 1..5 = I..V.
export function badgeDivision(tier: number): Division | null {
  return DIVISIONS[tier - 1] ?? null;
}

export function badgeLabel(badge: { tier: number; subtier: number } | undefined): string {
  const division = badge ? badgeDivision(badge.tier) : null;
  if (!badge || !division) return "Non classé";
  const roman = (["I", "II", "III", "IV", "V"] as const)[badge.subtier - 1] ?? "";
  return `${DIVISION_LABELS_FR[division]} ${roman}`.trim();
}
