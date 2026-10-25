import { badgeDivision, badgeLabel, DIVISION_COLORS } from "@/lib/rotk/ranks";
import type { ProgressionBadge } from "@/lib/rotk/types";

export function RankBadge({ badge, placementLeft }: { badge?: ProgressionBadge; placementLeft?: number }) {
  if (placementLeft && placementLeft > 0) {
    return <span className="text-xs text-dust">Placement ({placementLeft} restantes)</span>;
  }
  const division = badge ? badgeDivision(badge.tier) : null;
  const color = division ? DIVISION_COLORS[division] : "var(--color-dust)";
  return (
    <span
      className="font-display inline-block border px-1.5 text-sm leading-tight whitespace-nowrap"
      style={{ color, borderColor: color }}
    >
      {badgeLabel(badge)}
    </span>
  );
}
