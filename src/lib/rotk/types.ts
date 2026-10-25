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
