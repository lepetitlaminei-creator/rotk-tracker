import { formatNumber } from "@/lib/rotk/labels";
import type { PlayerSample } from "@/lib/rotk/ladderHistory";

const W = 1000;
const H = 140;
const PAD = 10;

// Courbe d'un joueur (rang ou score) à partir des relevés du classement.
export function PlayerChart({
  samples,
  metric,
}: {
  samples: PlayerSample[];
  metric: "rank" | "score";
}) {
  if (samples.length < 2) {
    return (
      <p className="text-sm text-dust">
        La courbe apparaît après deux relevés du classement (un toutes les 3 heures) où ce joueur est dans le top 150.
      </p>
    );
  }
  const value = (s: PlayerSample) => (metric === "rank" ? s.r : s.s);
  const times = samples.map((s) => new Date(s.t).getTime());
  const t0 = times[0];
  const span = times[times.length - 1] - t0 || 1;
  const values = samples.map(value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (t: number) => ((t - t0) / span) * W;
  // Rang : 1 en haut. Score : le plus haut en haut.
  const y = (v: number) =>
    metric === "rank" ? PAD + ((v - min) / range) * (H - 2 * PAD) : H - PAD - ((v - min) / range) * (H - 2 * PAD);
  const line = samples.map((s, i) => `${i ? "L" : "M"}${x(times[i]).toFixed(1)},${y(value(s)).toFixed(1)}`).join(" ");
  const best = metric === "rank" ? min : max;
  const fmt = (v: number) => (metric === "rank" ? `#${v}` : formatNumber(v));

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-dust">
        <span>
          {new Date(t0).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} → aujourd&apos;hui
        </span>
        <span>
          Meilleur : <span className="text-bone tabular">{fmt(best)}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Évolution du ${metric === "rank" ? "rang" : "score"}`}>
        <line x1={0} x2={W} y1={H - 1} y2={H - 1} stroke="var(--color-line)" />
        <path d={line} fill="none" stroke="var(--color-blood)" strokeWidth={2.5} strokeLinejoin="round" />
        <circle cx={x(times[times.length - 1])} cy={y(values[values.length - 1])} r={4} fill="var(--color-crown)" />
      </svg>
    </div>
  );
}
