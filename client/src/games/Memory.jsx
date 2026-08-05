import { useEffect, useMemo, useState } from "react";
import Leaderboard from "../components/Leaderboard.jsx";
import GameOverOverlay from "../components/GameOverOverlay.jsx";
import { useLeaderboard } from "../hooks/useLeaderboard.js";

const ICONS = ["✈️", "🎧", "🍎", "🎮", "🚀", "⚡", "🌍", "🍀"];

function shuffledDeck() {
  const deck = [...ICONS, ...ICONS]
    .map((icon, index) => ({ id: index, icon, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

function computeScore(moves, matchedPairs) {
  const base = matchedPairs * 100;
  const penalty = Math.max(0, moves - matchedPairs) * 5;
  return Math.max(0, base - penalty);
}

export default function Memory() {
  const { scores, loading, submitScore } = useLeaderboard("memory");
  const [cards, setCards] = useState(shuffledDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const matchedCount = useMemo(() => cards.filter((card) => card.matched).length / 2, [cards]);
  const isComplete = matchedCount === ICONS.length;
  const score = computeScore(moves, matchedCount);

  useEffect(() => {
    if (selected.length !== 2) return;
    setLocked(true);
    const [firstIndex, secondIndex] = selected;
    const timeout = setTimeout(() => {
      setCards((prev) => {
        const first = prev[firstIndex];
        const second = prev[secondIndex];
        const isMatch = first.icon === second.icon;
        return prev.map((card, index) => {
          if (index !== firstIndex && index !== secondIndex) return card;
          return {
            ...card,
            flipped: isMatch,
            matched: isMatch,
          };
        });
      });
      setSelected([]);
      setLocked(false);
    }, 700);
    return () => clearTimeout(timeout);
  }, [selected]);

  function handleFlip(index) {
    if (locked || isComplete) return;
    const card = cards[index];
    if (card.flipped || card.matched || selected.includes(index)) return;

    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, flipped: true } : c))
    );
    const nextSelected = [...selected, index];
    setSelected(nextSelected);
    if (nextSelected.length === 2) {
      setMoves((m) => m + 1);
    }
  }

  function resetGame() {
    setCards(shuffledDeck());
    setSelected([]);
    setMoves(0);
    setLocked(false);
  }

  return (
    <div className="game-shell">
      <div className="game-panel">
        <div className="game-panel-header">
          <h2>🧠 Memory</h2>
          <button className="btn btn-secondary" type="button" onClick={resetGame}>
            Nouvelle partie
          </button>
        </div>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Coups</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Paires trouvées</span>
            <span className="stat-value">
              {matchedCount}/{ICONS.length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
        <div className="game-board-container">
          <div className="game-board-wrap">
            <div className="memory-grid" style={{ gridTemplateColumns: "repeat(4, 76px)" }}>
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  className={`memory-card ${card.flipped ? "flipped" : ""} ${card.matched ? "matched" : ""}`}
                  onClick={() => handleFlip(index)}
                >
                  {card.flipped || card.matched ? card.icon : ""}
                </button>
              ))}
            </div>
          </div>
          <GameOverOverlay
            visible={isComplete}
            title="Bravo, toutes les paires trouvées !"
            score={score}
            onRestart={resetGame}
            onSubmitScore={(name) => submitScore(name, score)}
          />
        </div>
        <p className="game-controls-hint">Cliquez sur deux cartes pour trouver les paires identiques.</p>
      </div>
      <Leaderboard scores={scores} loading={loading} title="Meilleurs scores — Memory" />
    </div>
  );
}
