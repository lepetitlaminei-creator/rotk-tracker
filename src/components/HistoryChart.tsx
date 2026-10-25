import { formatNumber } from "@/lib/rotk/labels";
import type { StatusSample } from "@/lib/rotk/history";

const W = 1000;
const H = 160;
const PAD_Y = 8;

// Courbe du nombre de joueurs connectés, rendue côté serveur en SVG.
export function HistoryChart({ samples }: { samples: StatusSample[] }) {
  if (samples.length < 2) {
    return (
      <p className="text-sm text-dust">
        L&apos;historique se remplit : un relevé est enregistré chaque heure, la courbe apparaît après les deux premiers.
      </p>
    );
  }

  const times = samples.map((s) => new Date(s.t).getTime());
  const t0 = times[0];
  const span = times[times.length - 1] - t0 || 1;
  const peak = samples.reduce((best, s) => (s.players > best.players ? s : best), samples[0]);
  const max = Math.max(peak.players, 1);
  const avg = Math.round(samples.reduce((sum, s) => sum + s.players, 0) / samples.length);

  const x = (t: number) => ((t - t0) / span) * W;
  const y = (n: number) => H - PAD_Y - (n / max) * (H - 2 * PAD_Y);
  const line = samples.map((s, i) => `${i ? "L" : "M"}${x(times[i]).toFixed(1)},${y(s.players).toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  // Un repère par jour, à minuit UTC.
  const dayTicks: { at: number; label: string }[] = [];
  const firstDay = new Date(t0);
  firstDay.setUTCHours(0, 0, 0, 0);
  for (let d = firstDay.getTime() + 86_400_000; d < t0 + span; d += 86_400_000) {
    dayTicks.push({
      at: x(d),
      label: new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", timeZone: "UTC" }),
    });
  }

  return (
    <div>
      <dl className="mb-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <div>
          <dt className="text-dust">Pic</dt>
          <dd className="font-display text-3xl leading-none tabular">{formatNumber(peak.players)}</dd>
          <dd className="text-xs text-dust">
            {new Date(peak.t).toLocaleString("fr-FR", {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Paris",
            })}
          </dd>
        </div>
        <div>
          <dt className="text-dust">Moyenne</dt>
          <dd className="font-display text-3xl leading-none tabular">{formatNumber(avg)}</dd>
        </div>
      </dl>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label={`Joueurs connectés, pic à ${peak.players}`}>
        <defs>
          <linearGradient id="hist-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-blood)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--color-blood)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {dayTicks.map((tick) => (
          <g key={tick.at}>
            <line x1={tick.at} x2={tick.at} y1={0} y2={H} stroke="var(--color-line)" strokeWidth={1} />
            <text x={tick.at + 4} y={H + 14} fill="var(--color-dust)" fontSize={11}>
              {tick.label}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#hist-fill)" />
        <path d={line} fill="none" stroke="var(--color-blood)" strokeWidth={2} strokeLinejoin="round" />
        <circle cx={x(new Date(peak.t).getTime())} cy={y(peak.players)} r={3.5} fill="var(--color-crown)" />
      </svg>
    </div>
  );
}
