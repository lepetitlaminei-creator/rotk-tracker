import type { ServerStatus, UpdatePost } from "./types";

export const ROTK_BASE = process.env.ROTK_API_BASE ?? "https://rotk.app";

export class RotkApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

async function getJson<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${ROTK_BASE}${path}`, {
    next: { revalidate },
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new RotkApiError(`ROTK ${path} a répondu ${res.status}`, res.status);
  return (await res.json()) as T;
}

// Le launcher officiel interroge /api/status toutes les 60 s : on fait pareil.
export function getServerStatus(): Promise<ServerStatus> {
  return getJson<ServerStatus>("/api/status", 60);
}

export async function getUpdates(): Promise<UpdatePost[]> {
  const data = await getJson<{ updates: UpdatePost[] }>("/api/updates", 600);
  return data.updates ?? [];
}

export function absoluteAsset(path: string): string {
  return path.startsWith("http") ? path : `${ROTK_BASE}${path}`;
}
