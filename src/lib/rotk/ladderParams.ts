import type { LeaderboardSeasons, LadderMode, RegionCode } from "./types";

// Valeurs par défaut si /api/leaderboard/seasons ne répond pas.
const FALLBACK_REGIONS: RegionCode[] = ["eu", "na", "oce"];
const FALLBACK_MODES: LadderMode[] = ["solo", "duos", "trios"];

export type LadderView = "joueurs" | "parties" | "ligues";

export type LadderParams = {
  region: RegionCode;
  mode: LadderMode;
  season: string | undefined;
  view: LadderView;
  page: number;
  league: string | undefined;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function regionsOf(seasons: LeaderboardSeasons | null): RegionCode[] {
  return seasons?.regions?.length ? seasons.regions : FALLBACK_REGIONS;
}

export function modesOf(seasons: LeaderboardSeasons | null, season: string | undefined): LadderMode[] {
  const found = seasons?.seasons.find((s) => s.key === season);
  return found?.gameModes?.length ? found.gameModes : FALLBACK_MODES;
}

// Lit et valide les paramètres d'URL de /classements et /joueur.
export function parseLadderParams(sp: SearchParams, seasons: LeaderboardSeasons | null): LadderParams {
  const regions = regionsOf(seasons);
  const seasonKeys = seasons?.seasons.map((s) => s.key) ?? [];
  const rawSeason = first(sp.saison);
  const season = rawSeason && seasonKeys.includes(rawSeason) ? rawSeason : seasons?.current;
  const modes = modesOf(seasons, season);
  const rawRegion = first(sp.region) as RegionCode | undefined;
  const rawMode = first(sp.mode) as LadderMode | undefined;
  const rawView = first(sp.vue);
  return {
    region: rawRegion && regions.includes(rawRegion) ? rawRegion : regions[0],
    mode: rawMode && modes.includes(rawMode) ? rawMode : modes[0],
    season,
    view: rawView === "parties" || rawView === "ligues" ? rawView : "joueurs",
    page: Math.max(1, Math.floor(Number(first(sp.page)) || 1)),
    league: first(sp.ligue),
  };
}

export function ladderHref(params: LadderParams, overrides: Partial<LadderParams> = {}): string {
  const p = { ...params, ...overrides };
  const qs = new URLSearchParams();
  if (p.view !== "joueurs") qs.set("vue", p.view);
  qs.set("region", p.region);
  qs.set("mode", p.mode);
  if (p.season) qs.set("saison", p.season);
  if (p.page > 1) qs.set("page", String(p.page));
  if (p.view === "ligues" && p.league) qs.set("ligue", p.league);
  return `/classements?${qs}`;
}

export function playerHref(playerKey: string, params: Pick<LadderParams, "region" | "mode" | "season">): string {
  const qs = new URLSearchParams({ region: params.region, mode: params.mode });
  if (params.season) qs.set("saison", params.season);
  return `/joueur/${encodeURIComponent(playerKey)}?${qs}`;
}
