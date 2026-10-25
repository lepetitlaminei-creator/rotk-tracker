// Relevé horaire du statut ROTK, lancé par .github/workflows/collect.yml.
// Ajoute une ligne JSON par relevé dans <dossier>/status/AAAA-MM.jsonl.
// Usage : node scripts/collect-status.mjs <dossier>

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.ROTK_API_BASE ?? "https://rotk.app";
const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage : node scripts/collect-status.mjs <dossier>");
  process.exit(1);
}

const res = await fetch(`${base}/api/status`, { headers: { accept: "application/json" } });
if (!res.ok) {
  console.error(`rotk.app/api/status a répondu ${res.status}`);
  process.exit(1);
}
const status = await res.json();

// Format compact : une ligne par heure, environ 300 octets.
const sample = {
  t: status.sampledAt ?? new Date().toISOString(),
  online: Boolean(status.online),
  players: status.players,
  unique24h: status.uniquePlayers24h,
  regions: Object.fromEntries(
    (status.regions ?? []).map((r) => [r.region, { players: r.players, modes: r.modes }]),
  ),
};

const month = sample.t.slice(0, 7);
const dir = path.join(outDir, "status");
await mkdir(dir, { recursive: true });
await appendFile(path.join(dir, `${month}.jsonl`), `${JSON.stringify(sample)}\n`);
console.log(`Relevé ${sample.t} : ${sample.players} joueurs`);
