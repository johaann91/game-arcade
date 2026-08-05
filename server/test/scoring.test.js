import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidGame,
  validateScorePayload,
  buildEntry,
  insertAndTrim,
  topN,
  VALID_GAMES,
  MAX_ENTRIES,
  MAX_NAME_LENGTH,
} from "../scoring.js";

test("isValidGame accepte uniquement les jeux connus", () => {
  for (const game of VALID_GAMES) {
    assert.equal(isValidGame(game), true);
  }
  assert.equal(isValidGame("tetris"), false);
  assert.equal(isValidGame(""), false);
});

test("validateScorePayload rejette un score manquant ou négatif", () => {
  assert.equal(validateScorePayload({}).errors.length > 0, true);
  assert.equal(validateScorePayload({ score: -5 }).errors.length > 0, true);
  assert.equal(validateScorePayload({ score: "100" }).errors.length > 0, true);
});

test("validateScorePayload accepte un score valide et nettoie le nom", () => {
  const { errors, clean } = validateScorePayload({ name: "  Johann  ", score: 120 });
  assert.equal(errors.length, 0);
  assert.equal(clean.name, "Johann");
  assert.equal(clean.score, 120);
});

test("validateScorePayload retombe sur 'Joueur' si le nom est vide ou absent", () => {
  assert.equal(validateScorePayload({ score: 10 }).clean.name, "Joueur");
  assert.equal(validateScorePayload({ name: "   ", score: 10 }).clean.name, "Joueur");
});

test("validateScorePayload tronque les noms trop longs", () => {
  const longName = "x".repeat(50);
  const { clean } = validateScorePayload({ name: longName, score: 1 });
  assert.equal(clean.name.length, MAX_NAME_LENGTH);
});

test("buildEntry ajoute une date ISO", () => {
  const entry = buildEntry({ name: "Ana", score: 42 });
  assert.equal(entry.name, "Ana");
  assert.equal(entry.score, 42);
  assert.equal(Number.isNaN(new Date(entry.date).getTime()), false);
});

test("insertAndTrim trie par score décroissant et limite le nombre d'entrées", () => {
  const list = [
    { name: "A", score: 10 },
    { name: "B", score: 50 },
  ];
  const result = insertAndTrim(list, { name: "C", score: 30 }, 5);
  assert.deepEqual(
    result.map((e) => e.name),
    ["B", "C", "A"]
  );
});

test("insertAndTrim respecte la limite MAX_ENTRIES par défaut", () => {
  const list = Array.from({ length: MAX_ENTRIES }, (_, i) => ({
    name: `P${i}`,
    score: i,
  }));
  const result = insertAndTrim(list, { name: "New", score: 999 });
  assert.equal(result.length, MAX_ENTRIES);
  assert.equal(result[0].name, "New");
});

test("topN ne mute pas la liste d'origine", () => {
  const list = [
    { name: "A", score: 1 },
    { name: "B", score: 2 },
  ];
  const sorted = topN(list, 10);
  assert.deepEqual(
    list.map((e) => e.name),
    ["A", "B"]
  );
  assert.deepEqual(
    sorted.map((e) => e.name),
    ["B", "A"]
  );
});
