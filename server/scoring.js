// Logique pure (sans I/O) extraite du serveur pour pouvoir être testée
// unitairement (voir test/scoring.test.js), et exécutée en CI.

export const VALID_GAMES = ["snake", "memory", "2048", "breakout"];
export const MAX_ENTRIES = 10;
export const MAX_NAME_LENGTH = 20;

export function isValidGame(game) {
  return VALID_GAMES.includes(game);
}

export function validateScorePayload(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    return { errors: ["Corps de requête invalide."], clean: null };
  }

  const { name, score } = body;

  if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    errors.push("Le score doit être un nombre positif ou nul.");
  }

  if (errors.length > 0) {
    return { errors, clean: null };
  }

  const cleanName = (typeof name === "string" ? name : "Joueur")
    .trim()
    .slice(0, MAX_NAME_LENGTH);

  return {
    errors: [],
    clean: { name: cleanName || "Joueur", score },
  };
}

export function buildEntry({ name, score }) {
  return { name, score, date: new Date().toISOString() };
}

// Insère une entrée, trie par score décroissant, et ne garde que le top N.
export function insertAndTrim(list, entry, max = MAX_ENTRIES) {
  const next = [...list, entry].sort((a, b) => b.score - a.score).slice(0, max);
  return next;
}

export function topN(list, max = MAX_ENTRIES) {
  return [...list].sort((a, b) => b.score - a.score).slice(0, max);
}
