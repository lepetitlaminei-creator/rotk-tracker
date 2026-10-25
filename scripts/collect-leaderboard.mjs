// Relevé du classement ROTK (top 150 public), lancé par .github/workflows/collect.yml.
// Pour chaque région et mode de la saison en cours, écrit dans <dossier>/leaderboard/<saison>/<région>-<mode>/ :
//   players/<clé hachée>.jsonl  une ligne par joueur et par relevé (courbe de la fiche joueur)
//   daily/AAAA-MM-JJ.json       dernier relevé du jour (flèches de progression)
// Le relevé ne tourne que toutes les 3 heures, sauf avec FORCE=1.
// Usage : node scripts/collect-leaderboard.mjs <dossier>

import { createHash } from "node:crypto";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.ROTK_API_BASE ?? "https://rotk.app";
const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage : node scripts/collect-leaderboard.mjs <dossier>");
  process.exit(1);
}

const now = new Date();
if (now.getUTCHours() % 3 !== 0 && process.env.FORCE !== "1") {
  console.log("Classement : pas d'heure de relevé, rien à faire.");
  process.exit(0);
}

const PAGE = 50;
const DEPTH = 150;

// Même calcul que playerFileId dans src/lib/rotk/ladderHistory.ts.
const fileId = (key) => createHash("sha1").update(key).digest("hex").slice(0, 16);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (res.ok) return res.json();
    // 429 « busy » et 5xx sont fréquents sur le classement : on patiente.
    if (res.status !== 429 && res.status < 500) throw new Error(`${url} a répondu ${res.status}`);
    await sleep(2000 * (attempt + 1));
  }
  throw new Error(`${url} toujours indisponible`);
}

const seasons = await getJson(`${base}/api/leaderboard/seasons`);
const season = seasons.seasons.find((s) => s.key === seasons.current);
const modes = season?.gameModes ?? ["solo"];
const t = now.toISOString();
let failures = 0;

for (const region of seasons.regions) {
  for (const mode of modes) {
    const rows = [];
    try {
      for (let offset = 0; offset < DEPTH; offset += PAGE) {
        const qs = new URLSearchParams({ season: seasons.current, mode, type: "public", region, limit: PAGE, offset });
        const page = await getJson(`${base}/api/leaderboard/players?${qs}`);
        rows.push(...page.rows);
        if (page.rows.length < PAGE || rows.length >= page.total) break;
        await sleep(500);
      }
    } catch (err) {
      failures++;
      console.error(`Classement ${region}/${mode} : ${err.message}`);
      continue;
    }

    const dir = path.join(outDir, "leaderboard", seasons.current, `${region}-${mode}`);
    await mkdir(path.join(dir, "players"), { recursive: true });
    await mkdir(path.join(dir, "daily"), { recursive: true });
    for (const row of rows) {
      const line = {
        t,
        n: row.displayName,
        r: row.rank,
        s: row.score,
        w: row.wins,
        k: row.kills,
        d: row.deaths,
        g: row.games,
      };
      await appendFile(path.join(dir, "players", `${fileId(row.playerKey)}.jsonl`), `${JSON.stringify(line)}\n`);
    }
    const daily = { t, total: rows.length, rows: rows.map((r) => [r.playerKey, r.rank, r.score]) };
    await writeFile(path.join(dir, "daily", `${t.slice(0, 10)}.json`), JSON.stringify(daily));
    console.log(`Classement ${region}/${mode} : ${rows.length} joueurs`);
  }
}

// Une panne du classement ROTK ne doit pas faire échouer le relevé du statut.
if (failures) console.log(`Classement : ${failures} combinaison(s) indisponible(s) chez ROTK.`);
