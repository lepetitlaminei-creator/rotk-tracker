import { getLeaderboardPlayers, PAGE_SIZE, PUBLIC_LADDER_DEPTH } from "./api";
import type { LadderParams } from "./ladderParams";
import type { PlayerRow } from "./types";

// rotk.app n'a pas de route « fiche joueur » publique : on cherche le joueur
// dans le top 150 public (3 pages, mises en cache 2 minutes).
export async function findPlayer(
  playerKey: string,
  p: Pick<LadderParams, "region" | "mode" | "season">,
): Promise<{ row: PlayerRow; total: number } | null> {
  for (let offset = 0; offset < PUBLIC_LADDER_DEPTH; offset += PAGE_SIZE) {
    const page = await getLeaderboardPlayers({
      season: p.season,
      mode: p.mode,
      type: "public",
      region: p.region,
      limit: PAGE_SIZE,
      offset,
    });
    const row = page.rows.find((r) => r.playerKey === playerKey);
    if (row) return { row, total: page.total };
    if (page.rows.length < PAGE_SIZE) break;
  }
  return null;
}
