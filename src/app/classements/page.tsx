import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Chips } from "@/components/ladder/Chips";
import { RankBadge } from "@/components/ladder/RankBadge";
import { Unavailable } from "@/components/ladder/Unavailable";
import {
  getLeaderboardGames,
  getLeaderboardPlayers,
  getLeaderboardSeasons,
  getLeagueSeasons,
  getLeagueStandings,
  PAGE_SIZE,
  PUBLIC_LADDER_DEPTH,
} from "@/lib/rotk/api";
import { formatNumber, formatRelative, LADDER_MODE_LABELS, regionLabel, seasonLabel } from "@/lib/rotk/labels";
import { getPreviousRanks } from "@/lib/rotk/ladderHistory";
import {
  ladderHref,
  modesOf,
  parseLadderParams,
  playerHref,
  regionsOf,
  type LadderParams,
  type SearchParams,
} from "@/lib/rotk/ladderParams";
import {
  BEST_MATCHES_COUNTED,
  DIVISIONS,
  DIVISION_COLORS,
  DIVISION_LABELS_FR,
  KNOWN_THRESHOLDS,
  POINTS_PER_ASSIST,
  POINTS_PER_KILL,
  POINTS_PER_WIN,
  TIERS,
} from "@/lib/rotk/ranks";
import type { GameRow, LeaderboardSeasons, PlayerRow } from "@/lib/rotk/types";

export const metadata: Metadata = { title: "Classements" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const seasons = await getLeaderboardSeasons().catch(() => null);
  const params = parseLadderParams(sp, seasons);

  return (
    <div className="space-y-8">
      <AutoRefresh seconds={120} />
      <header>
        <h1 className="font-display text-5xl leading-none">Classements</h1>
        <p className="mt-2 max-w-2xl text-dust">
          Le top {PUBLIC_LADDER_DEPTH} public de chaque région, mis à jour toutes les 2 minutes depuis rotk.app.
        </p>
      </header>

      <Filters params={params} seasons={seasons} />

      {params.view === "joueurs" && <PlayersView params={params} seasons={seasons} />}
      {params.view === "parties" && <GamesView params={params} />}
      {params.view === "ligues" && <LeaguesView params={params} />}

      <RankSystem />
    </div>
  );
}

function Filters({ params, seasons }: { params: LadderParams; seasons: LeaderboardSeasons | null }) {
  const reset = { page: 1 };
  return (
    <section className="panel space-y-3 p-4">
      <Chips
        label="Vue"
        chips={[
          { view: "joueurs" as const, label: "Joueurs" },
          { view: "parties" as const, label: "Plus grosses parties" },
          { view: "ligues" as const, label: "Ligues & tournois" },
        ].map(({ view, label }) => ({
          href: ladderHref(params, { ...reset, view }),
          label,
          active: params.view === view,
        }))}
      />
      {params.view !== "ligues" && (
        <>
          <Chips
            label="Région"
            chips={regionsOf(seasons).map((region) => ({
              href: ladderHref(params, { ...reset, region }),
              label: regionLabel(region),
              active: params.region === region,
            }))}
          />
          <Chips
            label="Mode"
            chips={modesOf(seasons, params.season).map((mode) => ({
              href: ladderHref(params, { ...reset, mode }),
              label: LADDER_MODE_LABELS[mode] ?? mode,
              active: params.mode === mode,
            }))}
          />
          {seasons && (
            <Chips
              label="Saison"
              chips={seasons.seasons.map((s) => ({
                href: ladderHref(params, { ...reset, season: s.key }),
                label: s.live ? `${seasonLabel(s)} · live` : seasonLabel(s),
                active: params.season === s.key,
              }))}
            />
          )}
        </>
      )}
    </section>
  );
}

async function PlayersView({ params, seasons }: { params: LadderParams; seasons: LeaderboardSeasons | null }) {
  const lastPage = Math.ceil(PUBLIC_LADDER_DEPTH / PAGE_SIZE);
  const page = Math.min(params.page, lastPage);
  const [ladder, previous] = await Promise.allSettled([
    getLeaderboardPlayers({
      season: params.season,
      mode: params.mode,
      type: "public",
      region: params.region,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    params.season ? getPreviousRanks(params.season, params.region, params.mode) : Promise.resolve(new Map()),
  ]);
  if (ladder.status === "rejected") return <Unavailable what="Le classement" error={ladder.reason} />;

  const { rows, total } = ladder.value;
  const prevRanks = previous.status === "fulfilled" ? previous.value : new Map<string, number>();
  const pages = Math.min(Math.ceil(total / PAGE_SIZE), lastPage);
  const counted = ladder.value.countedGames ?? seasons?.countedGames ?? BEST_MATCHES_COUNTED;

  if (rows.length === 0) {
    return <div className="panel p-6 text-dust">Personne n&apos;est encore classé ici pour cette saison.</div>;
  }

  return (
    <section className="space-y-6">
      {page === 1 && <Podium rows={rows.slice(0, 3)} params={params} />}

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-dust">
            <tr className="border-b border-line">
              <th className="px-4 py-3">#</th>
              <th className="px-2 py-3">Joueur</th>
              <th className="px-2 py-3">Rang</th>
              <th className="px-2 py-3 text-right">Score</th>
              <th className="px-2 py-3 text-right">Wins</th>
              <th className="px-2 py-3 text-right">Kills</th>
              <th className="px-2 py-3 text-right">K/D</th>
              <th className="px-2 py-3 text-right">Parties</th>
              <th className="px-2 py-3 text-right">Place moy.</th>
              <th className="px-4 py-3 text-right">Vu</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.playerKey} className="border-b border-line/60 last:border-0 hover:bg-panel-2">
                <td className="px-4 py-2">
                  <span className="font-display text-xl tabular">{row.rank}</span>
                  <Movement now={row.rank} before={prevRanks.get(row.playerKey)} />
                </td>
                <td className="px-2 py-2">
                  <Link href={playerHref(row.playerKey, params)} className="font-medium hover:text-blood">
                    {row.displayName}
                  </Link>
                </td>
                <td className="px-2 py-2">
                  <RankBadge
                    badge={row.progression.badge}
                    placementLeft={row.progression.placementGamesRemaining}
                  />
                </td>
                <td className="px-2 py-2 text-right tabular text-bone">{formatNumber(row.score)}</td>
                <td className="px-2 py-2 text-right tabular">{formatNumber(row.wins)}</td>
                <td className="px-2 py-2 text-right tabular">{formatNumber(row.kills)}</td>
                <td className="px-2 py-2 text-right tabular">{kd(row)}</td>
                <td className="px-2 py-2 text-right tabular text-dust">{formatNumber(row.games)}</td>
                <td className="px-2 py-2 text-right tabular text-dust">{row.averagePlacement.toFixed(1)}</td>
                <td className="px-4 py-2 text-right text-xs text-dust">{formatRelative(row.lastPlayed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-dust">
        <p>
          Score = somme des {counted} meilleures parties. {formatNumber(total)} joueurs classés, top{" "}
          {PUBLIC_LADDER_DEPTH} visible sans compte.
        </p>
        {pages > 1 && (
          <nav className="flex gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={ladderHref(params, { page: n })}
                className={`font-display border px-3 text-lg ${n === page ? "border-blood text-bone" : "border-line hover:text-bone"}`}
              >
                {(n - 1) * PAGE_SIZE + 1}-{n * PAGE_SIZE}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

function kd(row: PlayerRow): string {
  return (row.kills / Math.max(row.deaths, 1)).toFixed(2);
}

function Movement({ now, before }: { now: number; before: number | undefined }) {
  if (before === undefined) return null;
  const diff = before - now;
  if (diff === 0) return null;
  return (
    <span
      className={`ml-1 text-xs tabular ${diff > 0 ? "text-crown" : "text-dust"}`}
      title={`${diff > 0 ? "+" : ""}${diff} place(s) depuis hier`}
    >
      {diff > 0 ? `▲${diff}` : `▼${-diff}`}
    </span>
  );
}

const PODIUM_STYLE = [
  { label: "1er", color: "var(--color-crown)", order: "sm:order-2", size: "text-6xl" },
  { label: "2e", color: "#b9c0c8", order: "sm:order-1 sm:mt-8", size: "text-5xl" },
  { label: "3e", color: "#a0673a", order: "sm:order-3 sm:mt-12", size: "text-5xl" },
];

function Podium({ rows, params }: { rows: PlayerRow[]; params: LadderParams }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {rows.map((row, i) => {
        const style = PODIUM_STYLE[i];
        return (
          <Link
            key={row.playerKey}
            href={playerHref(row.playerKey, params)}
            className={`panel block p-5 hover:bg-panel-2 ${style.order}`}
            style={{ borderColor: style.color }}
          >
            <p className="font-display text-xl" style={{ color: style.color }}>
              {style.label}
            </p>
            <p className="font-display truncate text-3xl leading-tight">{row.displayName}</p>
            <p className={`font-display leading-none tabular ${style.size}`}>{formatNumber(row.score)}</p>
            <p className="mt-2 text-sm text-dust">
              {formatNumber(row.wins)} wins · {formatNumber(row.kills)} kills · K/D {kd(row)}
            </p>
            <div className="mt-2">
              <RankBadge badge={row.progression.badge} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

async function GamesView({ params }: { params: LadderParams }) {
  let games: GameRow[];
  try {
    const page = await getLeaderboardGames({
      season: params.season,
      mode: params.mode,
      type: "public",
      region: params.region,
      limit: PAGE_SIZE,
    });
    games = page.rows;
  } catch (error) {
    return <Unavailable what="Le classement des parties" error={error} />;
  }
  if (games.length === 0) return <div className="panel p-6 text-dust">Aucune partie enregistrée ici.</div>;

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-dust">
          <tr className="border-b border-line">
            <th className="px-4 py-3">#</th>
            <th className="px-2 py-3">Joueur</th>
            <th className="px-2 py-3 text-right">Score</th>
            <th className="px-2 py-3 text-right">Place</th>
            <th className="px-2 py-3 text-right">Kills</th>
            {params.mode !== "solo" && <th className="px-2 py-3">Équipe</th>}
            <th className="px-4 py-3 text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, i) => (
            <tr key={game.matchId ?? i} className="border-b border-line/60 last:border-0">
              <td className="px-4 py-2 font-display text-xl tabular">{game.rank ?? i + 1}</td>
              <td className="px-2 py-2 font-medium">{game.displayName}</td>
              <td className="px-2 py-2 text-right tabular text-bone">{formatNumber(game.score)}</td>
              <td className="px-2 py-2 text-right tabular">
                {game.placement === 1 ? <span className="text-crown">Win</span> : `#${game.placement}`}
                {game.lobbySize ? <span className="text-dust">/{game.lobbySize}</span> : null}
              </td>
              <td className="px-2 py-2 text-right tabular">{formatNumber(game.kills)}</td>
              {params.mode !== "solo" && (
                <td className="px-2 py-2 text-xs text-dust">
                  {game.teammates?.map((m) => `${m.displayName} (${m.kills})`).join(", ") ?? ""}
                </td>
              )}
              <td className="px-4 py-2 text-right text-xs text-dust">
                {new Date(game.endedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PHASE_LABELS: Record<string, string> = {
  completed: "Terminé",
  upcoming: "À venir",
  applications: "Inscriptions",
  live: "En cours",
  active: "En cours",
};

async function LeaguesView({ params }: { params: LadderParams }) {
  let leagues;
  try {
    leagues = (await getLeagueSeasons()).filter((l) => l.public);
  } catch (error) {
    return <Unavailable what="La liste des ligues" error={error} />;
  }
  if (leagues.length === 0) return <div className="panel p-6 text-dust">Aucune ligue publique pour le moment.</div>;

  leagues.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const selected = leagues.find((l) => l.key === params.league) ?? leagues[0];
  const [standings] = await Promise.allSettled([getLeagueStandings(selected.key)]);

  return (
    <section className="space-y-4">
      <Chips
        label="Ligue"
        chips={leagues.map((l) => ({
          href: ladderHref(params, { league: l.key }),
          label: l.name,
          active: l.key === selected.key,
        }))}
      />
      <div className="panel p-5">
        <p className="text-xs uppercase tracking-wide text-blood">
          {PHASE_LABELS[selected.phase] ?? selected.phase} · {regionLabel(selected.region)} ·{" "}
          {LADDER_MODE_LABELS[selected.mode] ?? selected.mode}
        </p>
        <h2 className="font-display text-4xl leading-none">{selected.name}</h2>
        <p className="mt-1 text-sm text-dust">
          {new Date(selected.startsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}
          {selected.schedule.gamesPerNight} parties par soir · kill {selected.scoring.kill} pt (max{" "}
          {selected.scoring.killCap}), victoire {selected.scoring.placement[0] ?? 0} pts
        </p>
      </div>
      {standings.status === "rejected" ? (
        <Unavailable what="Le classement de cette ligue" error={standings.reason} />
      ) : (
        standings.value.tiers.map((tier) => (
          <div key={tier.tier} className="panel overflow-x-auto">
            <h3 className="font-display px-4 pt-3 text-2xl">{tier.name}</h3>
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-dust">
                <tr className="border-b border-line">
                  <th className="px-4 py-2">#</th>
                  <th className="px-2 py-2">Équipe</th>
                  <th className="px-2 py-2 text-right">Points</th>
                  <th className="px-2 py-2 text-right">Wins</th>
                  <th className="px-2 py-2 text-right">Kills</th>
                  <th className="px-4 py-2 text-right">Parties</th>
                </tr>
              </thead>
              <tbody>
                {tier.standings.map((team) => (
                  <tr key={team.name} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-2 font-display text-xl tabular">{team.rank}</td>
                    <td className="px-2 py-2">
                      <p className="font-medium">{team.name}</p>
                      <p className="text-xs text-dust">
                        {team.members.map((m) => (m.substitute ? `${m.displayName} (remplaçant)` : m.displayName)).join(", ")}
                      </p>
                    </td>
                    <td className="px-2 py-2 text-right tabular text-bone">{formatNumber(team.points)}</td>
                    <td className="px-2 py-2 text-right tabular">{team.wins}</td>
                    <td className="px-2 py-2 text-right tabular">{team.kills}</td>
                    <td className="px-4 py-2 text-right tabular text-dust">{team.games}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </section>
  );
}

function RankSystem() {
  return (
    <details className="panel p-6">
      <summary className="font-display cursor-pointer text-2xl">Comment marche le rang de saison</summary>
      <ul className="mt-3 space-y-1 text-dust">
        <li>
          Victoire : <span className="text-bone tabular">{formatNumber(POINTS_PER_WIN)}</span> points
        </li>
        <li>
          Kill (solo) ou kill d&apos;équipe : <span className="text-bone tabular">{formatNumber(POINTS_PER_KILL)}</span>{" "}
          points
        </li>
        <li>
          Assist d&apos;équipe (duos, trios) : <span className="text-bone tabular">{formatNumber(POINTS_PER_ASSIST)}</span>{" "}
          points
        </li>
        <li>
          Ton rang de saison additionne tes <span className="text-bone">{BEST_MATCHES_COUNTED} meilleures parties</span>.
          Avant {BEST_MATCHES_COUNTED} parties, tu es en placement.
        </li>
      </ul>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...DIVISIONS].reverse().map((division) => {
          const known = [...TIERS].reverse().flatMap((tier) => {
            const threshold = KNOWN_THRESHOLDS[`${division} ${tier}`];
            return threshold ? [{ tier, threshold }] : [];
          });
          return (
            <article key={division} className="panel p-4" style={{ borderColor: DIVISION_COLORS[division] }}>
              <h3 className="font-display text-2xl" style={{ color: DIVISION_COLORS[division] }}>
                {DIVISION_LABELS_FR[division]}
              </h3>
              {known.length > 0 ? (
                <ul className="mt-1 space-y-0.5 text-sm">
                  {known.map(({ tier, threshold }) => (
                    <li key={tier} className="flex justify-between text-dust">
                      <span>{tier}</span>
                      <span className="tabular text-bone">{formatNumber(threshold)} pts</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-dust">Seuils pas encore relevés</p>
              )}
            </article>
          );
        })}
      </div>
    </details>
  );
}
