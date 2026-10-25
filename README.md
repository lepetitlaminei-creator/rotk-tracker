# ROTK Tracker

Tracker de stats pour H1Z1 sur **Return of the King (ROTK)**, dans l'esprit des trackers de jeux compétitifs et avec l'ambiance KOTK 2016-2017.

Projet de fan, non affilié à ROTK ni à Daybreak Game Company.

## Ce qui marche aujourd'hui

- **Live** (`/`) : joueurs connectés, joueurs uniques sur 24 h, répartition par région et par mode, rafraîchie chaque minute. Dernières mises à jour ROTK.
- **Classements** (`/classements`) : système de rang de saison (score, divisions). Le classement en direct arrive à l'étape suivante.
- **`/api/status`** : relais JSON du statut ROTK, pour l'app de bureau.

## Données utilisées

| Source | Contenu | État |
| --- | --- | --- |
| `rotk.app/api/status` | joueurs en ligne par région et mode | branché |
| `rotk.app/api/updates` | patch notes et news | branché |
| classement `rotk.app/leaderboard` | rang, score, kills, wins, 10 meilleures parties | adresse d'API à confirmer |

## Feuille de route

1. Données : brancher l'API des classements et enregistrer un relevé chaque heure (historique, courbes de progression).
2. Site : profils joueurs, classements, comparaison entre potes.
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
