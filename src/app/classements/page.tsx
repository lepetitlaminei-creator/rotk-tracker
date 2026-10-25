import type { Metadata } from "next";
import {
  BEST_MATCHES_COUNTED,
  DIVISIONS,
  DIVISION_COLORS,
  DIVISION_LABELS_FR,
  KNOWN_THRESHOLDS,
  POINTS_PER_KILL,
  POINTS_PER_WIN,
  TIERS,
} from "@/lib/rotk/ranks";
import { formatNumber } from "@/lib/rotk/labels";

export const metadata: Metadata = { title: "Classements" };

export default function LeaderboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl leading-none">Classements</h1>
        <p className="mt-2 max-w-2xl text-dust">
          Le classement en direct par région et par mode arrive dès que la connexion à l&apos;API des
          classements de ROTK est branchée. En attendant, voici comment fonctionne le rang de saison.
        </p>
      </header>

      <section className="panel p-6">
        <h2 className="font-display text-2xl">Calcul du score</h2>
        <ul className="mt-3 space-y-1 text-dust">
          <li>
            Victoire : <span className="text-bone tabular">{formatNumber(POINTS_PER_WIN)}</span> points
          </li>
          <li>
            Kill : <span className="text-bone tabular">{formatNumber(POINTS_PER_KILL)}</span> points
          </li>
          <li>
            Ton rang de saison additionne tes <span className="text-bone">{BEST_MATCHES_COUNTED} meilleures parties</span>.
            Avant {BEST_MATCHES_COUNTED} parties, tu es en placement.
          </li>
        </ul>
        <p className="mt-3 text-xs text-dust">Valeurs relevées sur le classement officiel, pas annoncées par ROTK.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...DIVISIONS].reverse().map((division) => {
          const known = [...TIERS]
            .reverse()
            .flatMap((tier) => {
              const threshold = KNOWN_THRESHOLDS[`${division} ${tier}`];
              return threshold ? [{ tier, threshold }] : [];
            });
          return (
            <article key={division} className="panel p-5" style={{ borderColor: DIVISION_COLORS[division] }}>
              <h3 className="font-display text-3xl" style={{ color: DIVISION_COLORS[division] }}>
                {DIVISION_LABELS_FR[division]}
              </h3>
              <p className="text-xs text-dust">Tiers V à I</p>
              {known.length > 0 ? (
                <ul className="mt-2 space-y-0.5 text-sm">
                  {known.map(({ tier, threshold }) => (
                    <li key={tier} className="flex justify-between text-dust">
                      <span>{tier}</span>
                      <span className="tabular text-bone">{formatNumber(threshold)} pts</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-dust">Seuils pas encore relevés</p>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
