export function Unavailable({ what, error }: { what: string; error: unknown }) {
  const detail = error instanceof Error ? error.message : null;
  return (
    <div className="panel p-6">
      <p className="font-display text-2xl text-ember">{what} est indisponible</p>
      <p className="mt-1 text-dust">
        rotk.app ne répond pas pour le moment, même sur leur propre site. La page réessaie toute seule ; reviens dans
        quelques minutes.
      </p>
      {detail && <p className="mt-2 text-xs text-dust">Réponse de ROTK : {detail}</p>}
    </div>
  );
}
