// Formes des réponses de l'API publique de rotk.app.
// Vérifiées le 2026-10-25 sur /api/status et /api/updates.

export type RegionCode = "eu" | "na" | "oce" | "au" | "br" | (string & {});

export type ModeCounts = {
  solo: number;
  duos: number;
  trios: number;
  cz: number;
  menu: number;
};

export type RegionStatus = {
  region: RegionCode;
  players: number;
  modes: ModeCounts;
};

export type ServerStatus = {
  online: boolean;
  players: number;
  uniquePlayers24h: number;
  capacity: number | null;
  sampledAt: string;
  regions: RegionStatus[];
};

export type UpdatePost = {
  id: string;
  title: string;
  summary: string;
  type: "patch" | "dev";
  category: string | null;
  version: string | null;
  coverImage: string;
  videoUrl: string;
  publishedAt: string;
};

// Classement, saisons et ligues : relevés le 2026-10-25 dans le code du site
// (rotk.app/leaderboard). /api/leaderboard/seasons et /api/league/* ont été
// appelés pour de vrai ; /players et /games étaient en panne chez ROTK
// (500, 429, 504), leur forme vient donc du code JS et reste à confirmer.

export type LadderMode = "solo" | "duos" | "trios" | "fives";
export type MatchType = "public" | "league" | "tournament";

export type LeaderboardSeason = {
  key: string;
  name: string;
  live: boolean;
  startsAt: string | null;
  endsAt: string | null;
  gameModes: LadderMode[] | null;
  matchTypes: MatchType[] | null;
};

export type LeaderboardSeasons = {
  countedGames: number;
  current: string;
  regions: RegionCode[];
  seasons: LeaderboardSeason[];
};

export type ProgressionBadge = {
  // 0 = non classé, 1..7 = Bronze..Royalty
  tier: number;
  // 1..5 = I..V
  subtier: number;
};

export type PlayerRow = {
  rank: number;
  playerKey: string;
  displayName: string;
  score: number;
  wins: number;
  kills: number;
  deaths: number;
  games: number;
  countedGames: number;
  averagePlacement: number;
  bestScore: number;
  lastPlayed: string;
  progression?: {
    badge: ProgressionBadge;
    placementGamesRemaining: number;
    nextDivisionScore: number | null;
  };
};

export type GameRow = {
  rank?: number;
  matchId?: string;
  displayName: string;
  score: number;
  kills: number;
  assists?: number;
  placement: number;
  lobbySize?: number;
  survivedSeconds?: number;
  endedAt: string;
  map?: string;
  scoreBreakdown?: { placement: number; kills: number; assists: number };
  teammates?: { displayName: string; kills: number; assists: number }[];
};

export type LadderPage<Row> = {
  season: { name: string } | null;
  total: number;
  rows: Row[];
};

export type LadderQuery = {
  season?: string;
  mode: LadderMode;
  type: MatchType;
  region: RegionCode;
  limit: number;
  offset?: number;
};

export type LeagueSeason = {
  id: string;
  key: string;
  name: string;
  description: string;
  phase: string;
  mode: string;
  region: RegionCode;
  public: boolean;
  portalSlug: string | null;
  startsAt: string;
  endsAt: string | null;
  teamSize: number;
  scoring: { preset: string; kill: number; killCap: number; assist: number; placement: number[] };
  schedule: { startDate: string; timezone: string; weeks: number; gamesPerNight: number };
};

export type LeagueStanding = {
  rank: number;
  points: number;
  games: number;
  kills: number;
  wins: number;
  name: string;
  active: boolean;
  movement: string;
  members: { displayName: string; substitute: boolean }[];
};

export type LeagueStandings = {
  season: { key: string; name: string; phase: string };
  tiers: { tier: number; name: string; final: boolean; standings: LeagueStanding[] }[];
};
