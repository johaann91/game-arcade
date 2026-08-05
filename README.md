# Game Arcade

Site d'arcade en ligne avec 4 jeux (Snake, Memory, 2048, Casse-briques) et un
classement des meilleurs scores par jeu. Aucun compte requis : le nom du
joueur est saisi librement à la fin de chaque partie.

Design hybride inspiré de trois sites : le fond sombre et l'accent vert néon
de **Spotify**, le bleu marine / rouge et la structure en bandeau de
**Air France**, et la typographie/mise en page épurée d'**Apple**.

## Stack technique

- **Client** : React 19 + Vite, sans dépendance de routage (navigation par état), CSS pur.
- **Serveur** : Node.js + Express 5, persistance des scores dans un fichier JSON (`server/data/scores.json`), sans base de données.
- **Tests** : `node:test` / `node:assert` sur la logique métier pure (`server/scoring.js`).
- **CI** : GitHub Actions (`.github/workflows/ci.yml`) — lint + build du client, vérification syntaxique + tests unitaires du serveur, à chaque push/PR sur `main`. Pas de déploiement automatique.

## Démarrage local

### Serveur

```bash
cd server
npm install
npm start        # démarre sur http://localhost:5050
npm run dev       # avec rechargement automatique
npm test          # exécute les tests unitaires
```

> Le port 5050 est utilisé (plutôt que 5000) car sur macOS le port 5000 est
> souvent occupé par le récepteur AirPlay du Centre de contrôle, ce qui
> provoque une page d'erreur 403 au lieu de démarrer le serveur.

### Client

```bash
cd client
npm install
cp .env.example .env   # ajuster VITE_API_URL si besoin
npm run dev             # démarre sur http://localhost:5173
npm run lint
npm run build
```

## API

| Méthode | Route                 | Description                                   |
| ------- | --------------------- | ---------------------------------------------- |
| GET     | `/api/health`          | Vérifie que le serveur répond                  |
| GET     | `/api/scores/:game`    | Top 10 des scores pour `snake`, `memory`, `2048` ou `breakout` |
| POST    | `/api/scores/:game`    | Ajoute un score `{ name, score }`              |

## Jeux

- **Snake** — flèches ou Z/Q/S/D, mangez les pommes sans toucher les murs ni votre queue.
- **Memory** — retrouvez les 8 paires de cartes en un minimum de coups.
- **2048** — fusionnez les tuiles jusqu'à atteindre 2048 (et au-delà).
- **Casse-briques** — flèches gauche/droite ou Q/D, détruisez toutes les briques avec 3 vies.

## CI/CD

Le workflow `.github/workflows/ci.yml` définit deux jobs indépendants qui
s'exécutent à chaque push et pull request sur `main` :

- **client** : `npm ci`, `npm run lint` (oxlint), `npm run build` (Vite).
- **server** : `npm ci`, `node --check` sur les fichiers source, `npm test` (tests unitaires Node).

Aucune étape de déploiement n'est incluse : la CI valide uniquement la
qualité et le bon fonctionnement du code.
# game-arcade
