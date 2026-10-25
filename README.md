# ROTK Tracker

Tracker de stats pour H1Z1 sur **Return of the King (ROTK)**, dans l'esprit des trackers de jeux compétitifs et avec l'ambiance KOTK 2016-2017.

Projet de fan, non affilié à ROTK ni à Daybreak Game Company.

## Ce qui marche aujourd'hui

- **Live** (`/`) : joueurs connectés, joueurs uniques sur 24 h, répartition par région et par mode, rafraîchie chaque minute. Courbe d'affluence sur 7 jours (pic, moyenne). Dernières mises à jour ROTK.
- **Classements** (`/classements`) : système de rang de saison (score, divisions). Le classement en direct arrive à l'étape suivante.
- **`/api/status`** : relais JSON du statut ROTK, pour l'app de bureau.
- **`/api/history?days=7`** : relevés horaires (30 jours max), pour l'app de bureau.

## Historique

Le workflow GitHub Actions « Relevé horaire ROTK » (`.github/workflows/collect.yml`) interroge `rotk.app/api/status` chaque heure et ajoute une ligne à `status/AAAA-MM.jsonl` sur la branche `data`. Le site relit ces fichiers (variable `ROTK_HISTORY_URL`, par défaut le contenu brut de la branche `data` sur GitHub). Pas de base de données à gérer.

GitHub ne lance les workflows planifiés qu'une fois le fichier présent sur `main`. Pour un premier relevé immédiat : onglet Actions, « Relevé horaire ROTK », Run workflow. Si le dépôt est privé, le site ne peut pas lire `raw.githubusercontent.com` sans jeton : passer le dépôt en public ou pointer `ROTK_HISTORY_URL` ailleurs.

## Données utilisées

| Source | Contenu | État |
| --- | --- | --- |
| `rotk.app/api/status` | joueurs en ligne par région et mode | branché |
| `rotk.app/api/updates` | patch notes et news | branché |
| branche `data` du dépôt | relevé horaire du statut | branché |
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
