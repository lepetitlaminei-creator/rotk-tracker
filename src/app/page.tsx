import { AutoRefresh } from "@/components/AutoRefresh";
import { HistoryChart } from "@/components/HistoryChart";
import { ModeBar } from "@/components/ModeBar";
import { absoluteAsset, getServerStatus, getUpdates } from "@/lib/rotk/api";
import { getStatusHistory } from "@/lib/rotk/history";
import { formatNumber, regionLabel } from "@/lib/rotk/labels";
import type { ModeCounts, ServerStatus, UpdatePost } from "@/lib/rotk/types";

export const revalidate = 60;

function sumModes(status: ServerStatus): ModeCounts {
  const total: ModeCounts = { solo: 0, duos: 0, trios: 0, cz: 0, menu: 0 };
  for (const r of status.regions) {
    for (const key of Object.keys(total) as (keyof ModeCounts)[]) total[key] += r.modes[key] ?? 0;
  }
  return total;
}

export default async function LivePage() {
  const [status, updates, history] = await Promise.allSettled([
    getServerStatus(),
    getUpdates(),
    getStatusHistory(7),
  ]);

  return (
    <div className="space-y-10">
      <AutoRefresh seconds={60} />
      {status.status === "fulfilled" ? (
        <LiveStatus status={status.value} />
      ) : (
        <div className="panel p-6 text-dust">
          Impossible de joindre rotk.app pour le moment. La page réessaie toute seule chaque minute.
        </div>
      )}
      {history.status === "fulfilled" && (
        <section className="panel p-6">
          <h2 className="font-display text-2xl">Affluence sur 7 jours</h2>
          <div className="mt-3">
            <HistoryChart samples={history.value} />
          </div>
        </section>
      )}
      {updates.status === "fulfilled" && updates.value.length > 0 && <News updates={updates.value.slice(0, 3)} />}
    </div>
  );
}

function LiveStatus({ status }: { status: ServerStatus }) {
  const regions = [...status.regions].sort((a, b) => b.players - a.players);
  const sampled = new Date(status.sampledAt);
  return (
    <section className="space-y-6">
      <div className="panel flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm text-dust">
            <span className={`inline-block size-2 rounded-full ${status.online ? "bg-blood animate-pulse" : "bg-dust"}`} />
            {status.online ? "Serveurs en ligne" : "Serveurs hors ligne"}
          </p>
          <p className="font-display mt-1 text-7xl leading-none sm:text-8xl tabular">{formatNumber(status.players)}</p>
          <p className="text-dust">joueurs connectés en ce moment</p>
        </div>
        <div className="sm:text-right">
          <p className="font-display text-4xl leading-none tabular">{formatNumber(status.uniquePlayers24h)}</p>
          <p className="text-sm text-dust">joueurs uniques sur 24 h</p>
          <p className="mt-2 text-xs text-dust">
            Relevé à {sampled.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="font-display text-2xl">Tous serveurs, par mode</h2>
        <div className="mt-3">
          <ModeBar modes={sumModes(status)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((r) => (
          <article key={r.region} className="panel p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl">{regionLabel(r.region)}</h3>
              <span className="font-display text-3xl tabular">{formatNumber(r.players)}</span>
            </div>
            <div className="mt-3">
              <ModeBar modes={r.modes} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function News({ updates }: { updates: UpdatePost[] }) {
  return (
    <section>
      <h2 className="font-display text-3xl">Dernières mises à jour ROTK</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {updates.map((u) => (
          <a
            key={u.id}
            href={`https://rotk.app/updates`}
            target="_blank"
            rel="noreferrer"
            className="panel group block overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={absoluteAsset(u.coverImage)} alt="" className="aspect-video w-full object-cover opacity-80 group-hover:opacity-100" />
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-blood">
                {u.type === "patch" ? `Patch ${u.version ?? ""}` : "Dev"} ·{" "}
                {new Date(u.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
              <h3 className="font-display mt-1 text-xl leading-tight">{u.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-dust">{u.summary}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
