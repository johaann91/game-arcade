import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { isValidGame, validateScorePayload, buildEntry, insertAndTrim, topN, VALID_GAMES } from "./scoring.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "scores.json");
// Le port 5000 est souvent occupé sur macOS par le récepteur AirPlay
// (Centre de contrôle), ce qui provoque une erreur 403 au lieu de démarrer
// le serveur. On utilise donc un port moins courant par défaut.
const PORT = process.env.PORT || 5050;

const app = express();
app.use(cors());
app.use(express.json());

async function readScores() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return Object.fromEntries(VALID_GAMES.map((g) => [g, []]));
  }
}

async function writeScores(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/scores/:game", async (req, res) => {
  const { game } = req.params;
  if (!isValidGame(game)) {
    return res.status(400).json({ error: "Jeu inconnu" });
  }
  const scores = await readScores();
  res.json(topN(scores[game] || []));
});

app.post("/api/scores/:game", async (req, res) => {
  const { game } = req.params;
  if (!isValidGame(game)) {
    return res.status(400).json({ error: "Jeu inconnu" });
  }

  const { errors, clean } = validateScorePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const scores = await readScores();
  if (!scores[game]) scores[game] = [];
  scores[game] = insertAndTrim(scores[game], buildEntry(clean));

  await writeScores(scores);
  res.status(201).json(scores[game]);
});

app.listen(PORT, () => {
  console.log(`API des scores disponible sur http://localhost:${PORT}`);
});
