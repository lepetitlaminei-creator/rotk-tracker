import { NextResponse, type NextRequest } from "next/server";
import { getLeaderboardPlayers, getLeaderboardSeasons, PAGE_SIZE, RotkApiError } from "@/lib/rotk/api";
import { parseLadderParams } from "@/lib/rotk/ladderParams";

// Classement pour l'app de bureau : /api/leaderboard?region=eu&mode=solo&saison=season-1&page=1
export async function GET(req: NextRequest) {
  const seasons = await getLeaderboardSeasons().catch(() => null);
  const p = parseLadderParams(Object.fromEntries(req.nextUrl.searchParams), seasons);
  try {
    const ladder = await getLeaderboardPlayers({
      season: p.season,
      mode: p.mode,
      type: "public",
      region: p.region,
      limit: PAGE_SIZE,
      offset: (Math.min(p.page, 3) - 1) * PAGE_SIZE,
    });
    return NextResponse.json({ ...ladder, region: p.region, mode: p.mode, seasonKey: p.season });
  } catch (err) {
    const status = err instanceof RotkApiError && err.status ? err.status : 502;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur ROTK" }, { status });
  }
}
