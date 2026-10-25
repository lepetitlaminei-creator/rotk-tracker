import type { ModeCounts, RegionCode } from "./types";

export const REGION_LABELS: Record<string, string> = {
  eu: "Europe",
  na: "Amérique du Nord",
  // Codes de rotk.app : « oce » désigne l'Asie (SEA) et « au » l'Océanie.
  oce: "Asie (SEA)",
  au: "Océanie",
  br: "Amérique du Sud",
};

export const MODE_LABELS: Record<keyof ModeCounts, string> = {
  solo: "Solo",
  duos: "Duos",
  trios: "Trios",
  cz: "CZ",
  menu: "Dans le menu",
};

export const LADDER_MODE_LABELS: Record<string, string> = {
  solo: "Solo",
  duos: "Duos",
  trios: "Trios",
  fives: "Fives",
};

// Saisons « glissantes » de rotk.app, renvoyées avec un nom anglais.
const SEASON_NAMES_FR: Record<string, string> = {
  "30d": "30 derniers jours",
  "7d": "7 derniers jours",
  all: "Depuis le début",
};

export function seasonLabel(season: { key: string; name: string }): string {
  return SEASON_NAMES_FR[season.key] ?? season.name.replace(/^Season /, "Saison ");
}

export function regionLabel(code: RegionCode): string {
  return REGION_LABELS[code] ?? code.toUpperCase();
}

const nf = new Intl.NumberFormat("fr-FR");
export const formatNumber = (n: number) => nf.format(n);

export function formatRelative(iso: string, now = Date.now()): string {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 60) return `il y a ${Math.max(minutes, 1)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `il y a ${hours} h`;
  return `il y a ${Math.round(hours / 24)} j`;
}
