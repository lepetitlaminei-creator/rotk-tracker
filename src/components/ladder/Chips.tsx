import Link from "next/link";

export type Chip = { href: string; label: string; active: boolean };

export function Chips({ label, chips }: { label: string; chips: Chip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 text-xs uppercase tracking-wide text-dust">{label}</span>
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          scroll={false}
          aria-current={chip.active ? "page" : undefined}
          className={`font-display border px-3 text-lg leading-snug ${
            chip.active ? "border-blood bg-blood/15 text-bone" : "border-line text-dust hover:text-bone"
          }`}
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
