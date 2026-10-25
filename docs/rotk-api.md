# API publique de rotk.app

Relevé le 2026-10-25 dans le code du site (bundle Vite de rotk.app/leaderboard) et par appels directs.
Pas de clé : tout est en JSON sur `https://rotk.app`, réponses en `Cache-Control: no-store`.
Erreurs : `{ "error": { "code", "message" } }`, sauf le 504 Cloudflare qui répond en texte brut (`error code: 504`).
`/api/status` et `/api/population` n'ont pas d'en-tête CORS : à appeler côté serveur.

## Classement

| Endpoint | Accès | État au relevé |
| --- | --- | --- |
| `GET /api/leaderboard/seasons` | public | OK |
| `GET /api/leaderboard/players` | public, top 150 | en panne chez ROTK (500, 429, 504) |
| `GET /api/leaderboard/games` | public | en panne chez ROTK (504) |
| `GET /api/leaderboard/player-games?player=<playerKey>` | connexion Steam | 401 sans session |

Paramètres de `players` et `games` : `season` (`season-1`, `season-0`, `30d`, `7d`, `all`), `mode` (`solo`, `duos`, `trios`, `fives`), `type` (`public`, `league`, `tournament`), `region` (`eu`, `na`, `oce`, `au`, `br`), `limit` (50 sur le site), `offset`, `q` (recherche, connexion requise).
Sans connexion, rotk.app ne sert que le top 150. Réponse : `{ season, total, rows }`.

Attention aux codes région : `oce` = Asie (SEA), `au` = Océanie.

Badge de progression : `tier` 0 = non classé, 1..7 = Bronze..Royalty ; `subtier` 1..5 = I..V.
Barème : victoire 175 000, kill (ou kill d'équipe) 1 000, assist d'équipe 250. Score = 10 meilleures parties.

Les formes `PlayerRow` et `GameRow` (src/lib/rotk/types.ts) viennent du code JS du site, pas d'une vraie réponse : à revérifier quand le classement de ROTK remarchera.

## Ligues et tournois

- `GET /api/league/seasons` (option `?portal=<slug>`) : `{ seasons: LeagueSeason[] }`
- `GET /api/league/seasons/{key}` : `{ season }`
- `GET /api/league/seasons/{key}/standings` : `{ season, tiers: [{ tier, name, final, standings: [{ rank, points, games, kills, wins, name, members }] }] }`

## Autres

- `GET /api/status` : joueurs en ligne par région et mode.
- `GET /api/population?region=&mode=` : courbe de connexions (points toutes les 5 min), pics, historique par jour.
- `GET /api/updates`, `GET /api/updates/detail?id=` : patch notes.
- `GET /api/creators` : portails des créateurs (ligues privées).

Pas de page profil joueur sur rotk.app : la fiche joueur du tracker est construite à partir du top 150 et de nos relevés.
