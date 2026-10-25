import type { ModeCounts, RegionCode } from "./types";

export const REGION_LABELS: Record<string, string> = {
  eu: "Europe",
  na: "Amérique du Nord",
  oce: "Océanie",
  au: "Australie",
  br: "Brésil",
};

export const MODE_LABELS: Record<keyof ModeCounts, string> = {
  solo: "Solo",
  duos: "Duos",
  trios: "Trios",
  cz: "CZ",
  menu: "Dans le menu",
};

export function regionLabel(code: RegionCode): string {
  return REGION_LABELS[code] ?? code.toUpperCase();
}

const nf = new Intl.NumberFormat("fr-FR");
export const formatNumber = (n: number) => nf.format(n);
