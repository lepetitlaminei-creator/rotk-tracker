import type { ModeCounts, RegionCode } from "./types";

// Relevés horaires écrits par le workflow « Relevé horaire ROTK » sur la branche `data`.
export const HISTORY_BASE =
  process.env.ROTK_HISTORY_URL ??
  "https://raw.githubusercontent.com/lepetitlaminei-creator/rotk-tracker/data";

export type StatusSample = {
  t: string;
  online: boolean;
  players: number;
  unique24h: number;
  regions: Partial<Record<RegionCode, { players: number; modes: ModeCounts }>>;
};

function monthsCovering(from: Date, to: Date): string[] {
  const months: string[] = [];
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  while (d <= to) {
    months.push(d.toISOString().slice(0, 7));
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return months;
}

async function getMonth(month: string): Promise<StatusSample[]> {
  const res = await fetch(`${HISTORY_BASE}/status/${month}.jsonl`, { next: { revalidate: 900 } });
  // 404 : pas encore de relevé ce mois-ci.
  if (!res.ok) return [];
  const samples: StatusSample[] = [];
  for (const line of (await res.text()).split("\n")) {
    if (!line.trim()) continue;
    try {
      samples.push(JSON.parse(line) as StatusSample);
    } catch {
      // Ligne tronquée : on l'ignore.
    }
  }
  return samples;
}

export async function getStatusHistory(days = 7): Promise<StatusSample[]> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const months = await Promise.all(monthsCovering(from, to).map(getMonth));
  return months
    .flat()
    .filter((s) => new Date(s.t) >= from)
    .sort((a, b) => a.t.localeCompare(b.t));
}
