import { useCallback, useEffect, useState } from "react";
import Leaderboard from "../components/Leaderboard.jsx";
import GameOverOverlay from "../components/GameOverOverlay.jsx";
import { useLeaderboard } from "../hooks/useLeaderboard.js";

const SIZE = 4;

const TILE_COLORS = {
  2: { bg: "#1a2a1f", color: "#e6e6e6" },
  4: { bg: "#1f3a28", color: "#e6e6e6" },
  8: { bg: "#1c5734", color: "#ffffff" },
  16: { bg: "#177040", color: "#ffffff" },
  32: { bg: "#0f8a4c", color: "#ffffff" },
  64: { bg: "#0da357", color: "#ffffff" },
  128: { bg: "#1ed760", color: "#06210f" },
  256: { bg: "#21e065", color: "#06210f" },
  512: { bg: "#4fe98a", color: "#06210f" },
  1024: { bg: "#8bf3b3", color: "#06210f" },
  2048: { bg: "#c8ffdd", color: "#06210f" },
};

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(grid) {
  const empties = [];
  grid.forEach((row, y) =>
    row.forEach((value, x) => {
      if (value === 0) empties.push({ x, y });
    })
  );
  if (empties.length === 0) return grid;
  const { x, y } = empties[Math.floor(Math.random() * empties.length)];
  const next = grid.map((row) => [...row]);
  next[y][x] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function startGrid() {
  let grid = emptyGrid();
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return grid;
}

function slideRowLeft(row) {
  const values = row.filter((value) => value !== 0);
  let gained = 0;
  for (let i = 0; i < values.length - 1; i += 1) {
    if (values[i] !== 0 && values[i] === values[i + 1]) {
      values[i] *= 2;
      gained += values[i];
      values[i + 1] = 0;
    }
  }
  const merged = values.filter((value) => value !== 0);
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained };
}

function rotateGridLeft(grid) {
  const next = emptyGrid();
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      next[SIZE - 1 - x][y] = grid[y][x];
    }
  }
  return next;
}

function moveLeft(grid) {
  let gained = 0;
  const next = grid.map((row) => {
    const { row: newRow, gained: rowGain } = slideRowLeft(row);
    gained += rowGain;
    return newRow;
  });
  return { grid: next, gained };
}

function move(grid, direction) {
  let rotations = 0;
  if (direction === "up") rotations = 3;
  if (direction === "right") rotations = 2;
  if (direction === "down") rotations = 1;

  let working = grid;
  for (let i = 0; i < rotations; i += 1) working = rotateGridLeft(working);

  const { grid: moved, gained } = moveLeft(working);

  let result = moved;
  for (let i = 0; i < (4 - rotations) % 4; i += 1) result = rotateGridLeft(result);

  return { grid: result, gained };
}

function gridsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function canMove(grid) {
  for (const direction of ["left", "right", "up", "down"]) {
    const { grid: moved } = move(grid, direction);
    if (!gridsEqual(moved, grid)) return true;
  }
  return false;
}

const KEY_TO_DIRECTION = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  q: "left",
  d: "right",
  z: "up",
  s: "down",
};

export default function Game2048() {
  const { scores, loading, submitScore } = useLeaderboard("2048");
  const [grid, setGrid] = useState(startGrid);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = useCallback(() => {
    setGrid(startGrid());
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    function handleKey(event) {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction || gameOver) return;
      event.preventDefault();

      setGrid((prevGrid) => {
        const { grid: moved, gained } = move(prevGrid, direction);
        if (gridsEqual(moved, prevGrid)) return prevGrid;
        const withNewTile = addRandomTile(moved);
        setScore((s) => s + gained);
        if (!canMove(withNewTile)) {
          setGameOver(true);
        }
        return withNewTile;
      });
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  return (
    <div className="game-shell">
      <div className="game-panel">
        <div className="game-panel-header">
          <h2>🔢 2048</h2>
          <button className="btn btn-secondary" type="button" onClick={resetGame}>
            Nouvelle partie
          </button>
        </div>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
        <div className="game-board-container">
          <div className="game-board-wrap">
            <div className="grid-2048">
              {grid.map((row, y) =>
                row.map((value, x) => {
                  const style = TILE_COLORS[value];
                  return (
                    <div
                      key={`${x}-${y}`}
                      className="tile-2048"
                      style={
                        value
                          ? { background: style?.bg ?? "#c8ffdd", color: style?.color ?? "#06210f" }
                          : undefined
                      }
                    >
                      {value !== 0 ? value : ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <GameOverOverlay
            visible={gameOver}
            title="Plus aucun mouvement possible"
            score={score}
            onRestart={resetGame}
            onSubmitScore={(name) => submitScore(name, score)}
          />
        </div>
        <p className="game-controls-hint">Flèches ou Z/Q/S/D pour déplacer les tuiles.</p>
      </div>
      <Leaderboard scores={scores} loading={loading} title="Meilleurs scores — 2048" />
    </div>
  );
}
