import { NextResponse, type NextRequest } from "next/server";
import { getLeaderboardSeasons } from "@/lib/rotk/api";
import { findPlayer } from "@/lib/rotk/findPlayer";
import { getPlayerHistory } from "@/lib/rotk/ladderHistory";
import { parseLadderParams } from "@/lib/rotk/ladderParams";

// Fiche joueur pour l'app de bureau : /api/player/<playerKey>?region=eu&mode=solo
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const key = decodeURIComponent((await params).key);
  const seasons = await getLeaderboardSeasons().catch(() => null);
  const p = parseLadderParams(Object.fromEntries(req.nextUrl.searchParams), seasons);
  const [found, history] = await Promise.allSettled([
    findPlayer(key, p),
    p.season ? getPlayerHistory(p.season, p.region, p.mode, key) : Promise.resolve([]),
  ]);
  return NextResponse.json({
    region: p.region,
    mode: p.mode,
    season: p.season,
    player: found.status === "fulfilled" ? (found.value?.row ?? null) : null,
    ladderAvailable: found.status === "fulfilled",
    history: history.status === "fulfilled" ? history.value : [],
  });
}
