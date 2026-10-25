import type {
  GameRow,
  LadderPage,
  LadderQuery,
  LeaderboardSeasons,
  LeagueSeason,
  LeagueStandings,
  PlayerRow,
  ServerStatus,
  UpdatePost,
} from "./types";

export const ROTK_BASE = process.env.ROTK_API_BASE ?? "https://rotk.app";

export class RotkApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

// rotk.app renvoie { error: { code, message } }, sauf derrière un 504
// Cloudflare qui répond en texte brut (« error code: 504 »).
async function readError(res: Response, path: string): Promise<RotkApiError> {
  let message = `ROTK ${path} a répondu ${res.status}`;
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    if (body.error?.message) message = body.error.message;
  } catch {
    // Pas du JSON.
  }
  return new RotkApiError(message, res.status);
}

async function getJson<T>(path: string, revalidate: number): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${ROTK_BASE}${path}`, {
      next: { revalidate },
      headers: { accept: "application/json" },
    });
    if (res.ok) return (await res.json()) as T;
    // Le classement répond souvent 429 « busy » : on retente une fois.
    if (attempt === 0 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 800));
      continue;
    }
    throw await readError(res, path);
  }
}

function query(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }
  return qs.toString();
}

// Le launcher officiel interroge /api/status toutes les 60 s : on fait pareil.
export function getServerStatus(): Promise<ServerStatus> {
  return getJson<ServerStatus>("/api/status", 60);
}

export async function getUpdates(): Promise<UpdatePost[]> {
  const data = await getJson<{ updates: UpdatePost[] }>("/api/updates", 600);
  return data.updates ?? [];
}

export function getLeaderboardSeasons(): Promise<LeaderboardSeasons> {
  return getJson<LeaderboardSeasons>("/api/leaderboard/seasons", 3600);
}

// En anonyme, rotk.app ne sert que le top 150.
export const PUBLIC_LADDER_DEPTH = 150;
export const PAGE_SIZE = 50;

export function getLeaderboardPlayers(q: LadderQuery): Promise<LadderPage<PlayerRow>> {
  return getJson<LadderPage<PlayerRow>>(`/api/leaderboard/players?${query(q)}`, 120);
}

export function getLeaderboardGames(q: LadderQuery): Promise<LadderPage<GameRow>> {
  return getJson<LadderPage<GameRow>>(`/api/leaderboard/games?${query(q)}`, 120);
}

export async function getLeagueSeasons(): Promise<LeagueSeason[]> {
  const data = await getJson<{ seasons: LeagueSeason[] }>("/api/league/seasons", 600);
  return data.seasons ?? [];
}

export function getLeagueStandings(key: string): Promise<LeagueStandings> {
  return getJson<LeagueStandings>(`/api/league/seasons/${encodeURIComponent(key)}/standings`, 300);
}

export function absoluteAsset(path: string): string {
  return path.startsWith("http") ? path : `${ROTK_BASE}${path}`;
}
