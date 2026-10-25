import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Chips } from "@/components/ladder/Chips";
import { PlayerChart } from "@/components/ladder/PlayerChart";
import { RankBadge } from "@/components/ladder/RankBadge";
import { findPlayer } from "@/lib/rotk/findPlayer";
import { getLeaderboardSeasons } from "@/lib/rotk/api";
import { formatNumber, formatRelative, LADDER_MODE_LABELS, regionLabel, seasonLabel } from "@/lib/rotk/labels";
import { getPlayerHistory } from "@/lib/rotk/ladderHistory";
import { ladderHref, modesOf, parseLadderParams, playerHref, regionsOf, type SearchParams } from "@/lib/rotk/ladderParams";
import { badgeDivision, DIVISION_COLORS } from "@/lib/rotk/ranks";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ key: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const key = decodeURIComponent((await params).key);
  const seasons = await getLeaderboardSeasons().catch(() => null);
  const p = parseLadderParams(await searchParams, seasons);
  const found = await findPlayer(key, p).catch(() => null);
  const name = found?.row.displayName ?? "Joueur";
  return {
    title: name,
    description: found
      ? `#${found.row.rank} en ${regionLabel(p.region)} ${LADDER_MODE_LABELS[p.mode] ?? p.mode} · ${formatNumber(found.row.score)} pts`
      : undefined,
  };
}

export default async function PlayerPage({ params, searchParams }: Props) {
  const key = decodeURIComponent((await params).key);
  const seasons = await getLeaderboardSeasons().catch(() => null);
  const p = parseLadderParams(await searchParams, seasons);

  const [found, history] = await Promise.allSettled([
    findPlayer(key, p),
    p.season ? getPlayerHistory(p.season, p.region, p.mode, key) : Promise.resolve([]),
  ]);
  const samples = history.status === "fulfilled" ? history.value : [];
  const row = found.status === "fulfilled" ? found.value?.row : undefined;
  const last = samples.at(-1);
  const name = row?.displayName ?? last?.n ?? "Joueur inconnu";
  const division = row?.progression ? badgeDivision(row.progression.badge.tier) : null;
  const season = seasons?.seasons.find((s) => s.key === p.season);
  const accent = division ? DIVISION_COLORS[division] : "var(--color-blood)";

  return (
    <div className="space-y-6">
      <AutoRefresh seconds={120} />
      <Link href={ladderHref(p)} className="text-sm text-dust hover:text-bone">
        ← Classement {regionLabel(p.region)} {LADDER_MODE_LABELS[p.mode] ?? p.mode}
      </Link>

      <header className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: accent }}>
        <div>
          <p className="text-xs uppercase tracking-wide text-blood">
            {regionLabel(p.region)} · {LADDER_MODE_LABELS[p.mode] ?? p.mode}
            {season && ` · ${seasonLabel(season)}`}
          </p>
          <h1 className="font-display text-6xl leading-none break-all">{name}</h1>
          <div className="mt-2">
            {row ? (
              <RankBadge badge={row.progression?.badge} placementLeft={row.progression?.placementGamesRemaining} />
            ) : null}
          </div>
        </div>
        {(row || last) && (
          <div className="sm:text-right">
            <p className="font-display text-7xl leading-none tabular" style={{ color: accent }}>
              #{row?.rank ?? last?.r}
            </p>
            <p className="text-sm text-dust">{formatNumber(row?.score ?? last?.s ?? 0)} points</p>
          </div>
        )}
      </header>

      <section className="panel space-y-3 p-4">
        <Chips
          label="Région"
          chips={regionsOf(seasons).map((region) => ({
            href: playerHref(key, { ...p, region }),
            label: regionLabel(region),
            active: p.region === region,
          }))}
        />
        <Chips
          label="Mode"
          chips={modesOf(seasons, p.season).map((mode) => ({
            href: playerHref(key, { ...p, mode }),
            label: LADDER_MODE_LABELS[mode] ?? mode,
            active: p.mode === mode,
          }))}
        />
      </section>

      {row ? (
        <Stats row={row} />
      ) : found.status === "rejected" ? (
        <div className="panel p-6 text-dust">
          Le classement de rotk.app ne répond pas pour le moment.
          {last && ` Dernières stats connues, relevées ${formatRelative(last.t)}.`}
          {last && <LastKnown sample={last} />}
        </div>
      ) : (
        <div className="panel p-6 text-dust">
          Ce joueur n&apos;est pas dans le top 150 public de {regionLabel(p.region)} en{" "}
          {LADDER_MODE_LABELS[p.mode] ?? p.mode} cette saison. rotk.app ne montre pas plus loin sans connexion Steam.
          Essaie une autre région ou un autre mode.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="font-display text-2xl">Évolution du rang</h2>
          <div className="mt-3">
            <PlayerChart samples={samples} metric="rank" />
          </div>
        </div>
        <div className="panel p-6">
          <h2 className="font-display text-2xl">Évolution du score</h2>
          <div className="mt-3">
            <PlayerChart samples={samples} metric="score" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs uppercase tracking-wide text-dust">{label}</p>
      <p className="font-display text-4xl leading-none tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-dust">{hint}</p>}
    </div>
  );
}

function Stats({ row }: { row: NonNullable<Awaited<ReturnType<typeof findPlayer>>>["row"] }) {
  const games = Math.max(row.games, 1);
  const next = row.progression?.nextDivisionScore;
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Stat label="Wins" value={formatNumber(row.wins)} hint={`${((row.wins / games) * 100).toFixed(1)} % des parties`} />
      <Stat label="Kills" value={formatNumber(row.kills)} hint={`${(row.kills / games).toFixed(2)} par partie`} />
      <Stat label="K/D" value={(row.kills / Math.max(row.deaths, 1)).toFixed(2)} hint={`${formatNumber(row.deaths)} morts`} />
      <Stat label="Parties" value={formatNumber(row.games)} hint={`dernière ${formatRelative(row.lastPlayed)}`} />
      <Stat label="Place moyenne" value={row.averagePlacement.toFixed(1)} />
      <Stat label="Meilleure partie" value={formatNumber(row.bestScore)} hint="points" />
      <Stat label="Parties comptées" value={`${row.countedGames}`} hint="meilleures parties de la saison" />
      <Stat
        label="Prochaine division"
        value={next ? formatNumber(Math.max(next - row.score, 0)) : "—"}
        hint={next ? "points à gagner" : "division max ou inconnue"}
      />
    </section>
  );
}

function LastKnown({ sample }: { sample: { w: number; k: number; d: number; g: number } }) {
  return (
    <p className="mt-2 text-bone tabular">
      {formatNumber(sample.w)} wins · {formatNumber(sample.k)} kills · K/D {(sample.k / Math.max(sample.d, 1)).toFixed(2)} ·{" "}
      {formatNumber(sample.g)} parties
    </p>
  );
}
