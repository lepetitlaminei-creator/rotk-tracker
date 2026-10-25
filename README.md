# ROTK Tracker

Tracker de stats pour H1Z1 sur **Return of the King (ROTK)**, dans l'esprit des trackers de jeux compétitifs et avec l'ambiance KOTK 2016-2017.

Projet de fan, non affilié à ROTK ni à Daybreak Game Company.

## Ce qui marche aujourd'hui

- **Live** (`/`) : joueurs connectés, joueurs uniques sur 24 h, répartition par région et par mode, rafraîchie chaque minute. Courbe d'affluence sur 7 jours (pic, moyenne). Dernières mises à jour ROTK.
- **Classements** (`/classements`) : top 150 public par région, mode et saison, podium, badges de rang, flèches de progression depuis la veille. Vue « plus grosses parties » et vue « ligues & tournois » (classement par tier des équipes).
- **Fiche joueur** (`/joueur/<clé>`) : rang, score, wins, kills, K/D, place moyenne, points avant la division suivante, courbes de rang et de score à partir de nos relevés.
- **`/api/status`** : relais JSON du statut ROTK, pour l'app de bureau.
- **`/api/history?days=7`** : relevés horaires (30 jours max), pour l'app de bureau.
- **`/api/leaderboard?region=eu&mode=solo&page=1`** et **`/api/player/<clé>`** : classement et fiche joueur, pour l'app de bureau.

## Historique

Le workflow GitHub Actions « Relevé horaire ROTK » (`.github/workflows/collect.yml`) interroge `rotk.app/api/status` chaque heure et ajoute une ligne à `status/AAAA-MM.jsonl` sur la branche `data`. Toutes les 3 heures, il relève aussi le top 150 de chaque région et mode de la saison en cours (`leaderboard/<saison>/<région>-<mode>/`) : une ligne par joueur pour les courbes de la fiche joueur, et un instantané par jour pour les flèches de progression. Une panne du classement ROTK ne bloque pas le relevé du statut. Le site relit ces fichiers (variable `ROTK_HISTORY_URL`, par défaut le contenu brut de la branche `data` sur GitHub). Pas de base de données à gérer.

GitHub ne lance les workflows planifiés qu'une fois le fichier présent sur `main`. Pour un premier relevé immédiat : onglet Actions, « Relevé horaire ROTK », Run workflow. Si le dépôt est privé, le site ne peut pas lire `raw.githubusercontent.com` sans jeton : passer le dépôt en public ou pointer `ROTK_HISTORY_URL` ailleurs.

## Données utilisées

| Source | Contenu | État |
| --- | --- | --- |
| `rotk.app/api/status` | joueurs en ligne par région et mode | branché |
| `rotk.app/api/updates` | patch notes et news | branché |
| branche `data` du dépôt | relevé horaire du statut | branché |
| `rotk.app/api/leaderboard/*` | classement, saisons, plus grosses parties | branché (format à confirmer, en panne chez ROTK au 2026-10-25) |
| `rotk.app/api/league/*` | ligues et tournois | branché |
| branche `data` du dépôt | relevé du top 150 toutes les 3 h | branché |

Détail des endpoints : [docs/rotk-api.md](docs/rotk-api.md).

## Feuille de route

1. Données : confirmer le format du classement quand ROTK le remet en ligne.
2. Site : recherche de joueur, comparaison entre potes.
3. App Windows : même interface, plus suivi de session et notifications de montée de rang.
4. Extras : groupes, tournois, records, overlay.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000. Variable optionnelle : `ROTK_API_BASE` (par défaut `https://rotk.app`).

## Mise en ligne

Le site se déploie tel quel sur Vercel (gratuit) : importer le dépôt GitHub, aucun réglage nécessaire.
