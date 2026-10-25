import { createHash } from "node:crypto";
import { HISTORY_BASE } from "./history";

// Relevés du classement écrits par scripts/collect-leaderboard.mjs sur la branche `data` :
//   leaderboard/<saison>/<région>-<mode>/players/<clé hachée>.jsonl  une ligne par relevé
//   leaderboard/<saison>/<région>-<mode>/daily/AAAA-MM-JJ.json       dernier relevé du jour
// Garder playerFileId identique à celui du script.

export type PlayerSample = {
  t: string;
  n: string;
  r: number;
  s: number;
  w: number;
  k: number;
  d: number;
  g: number;
};

export type DailySnapshot = {
  t: string;
  total: number;
  // [playerKey, rang, score]
  rows: [string, number, number][];
};

export function playerFileId(playerKey: string): string {
  return createHash("sha1").update(playerKey).digest("hex").slice(0, 16);
}

function comboPath(season: string, region: string, mode: string): string {
  return `${HISTORY_BASE}/leaderboard/${encodeURIComponent(season)}/${region}-${mode}`;
}

export async function getPlayerHistory(
  season: string,
  region: string,
  mode: string,
  playerKey: string,
): Promise<PlayerSample[]> {
  const res = await fetch(`${comboPath(season, region, mode)}/players/${playerFileId(playerKey)}.jsonl`, {
    next: { revalidate: 900 },
  });
  // 404 : joueur jamais relevé dans le top 150.
  if (!res.ok) return [];
  const samples: PlayerSample[] = [];
  for (const line of (await res.text()).split("\n")) {
    if (!line.trim()) continue;
    try {
      samples.push(JSON.parse(line) as PlayerSample);
    } catch {
      // Ligne tronquée : on l'ignore.
    }
  }
  return samples.sort((a, b) => a.t.localeCompare(b.t));
}

// Rangs de la veille (UTC), pour les flèches de progression du classement.
export async function getPreviousRanks(season: string, region: string, mode: string): Promise<Map<string, number>> {
  const day = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const res = await fetch(`${comboPath(season, region, mode)}/daily/${day}.json`, { next: { revalidate: 3600 } });
  if (!res.ok) return new Map();
  try {
    const snapshot = (await res.json()) as DailySnapshot;
    return new Map(snapshot.rows.map(([key, rank]) => [key, rank]));
  } catch {
    return new Map();
  }
}
