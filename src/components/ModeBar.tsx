import { MODE_LABELS, formatNumber } from "@/lib/rotk/labels";
import type { ModeCounts } from "@/lib/rotk/types";

const ORDER: (keyof ModeCounts)[] = ["solo", "duos", "trios", "cz", "menu"];
const COLORS: Record<keyof ModeCounts, string> = {
  solo: "var(--color-blood)",
  duos: "var(--color-ember)",
  trios: "var(--color-crown)",
  cz: "#6fa8ff",
  menu: "var(--color-line)",
};

export function ModeBar({ modes }: { modes: ModeCounts }) {
  const total = ORDER.reduce((sum, m) => sum + modes[m], 0) || 1;
  const visible = ORDER.filter((m) => modes[m] > 0);
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden bg-ink">
        {visible.map((m) => (
          <div key={m} style={{ width: `${(modes[m] / total) * 100}%`, background: COLORS[m] }} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {visible.map((m) => (
          <li key={m} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-dust">
              <span className="inline-block size-2" style={{ background: COLORS[m] }} />
              {MODE_LABELS[m]}
            </span>
            <span className="tabular">{formatNumber(modes[m])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
