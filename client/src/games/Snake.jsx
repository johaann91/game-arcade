import { useCallback, useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard.jsx";
import GameOverOverlay from "../components/GameOverOverlay.jsx";
import { useLeaderboard } from "../hooks/useLeaderboard.js";

const GRID_SIZE = 18;
const CELL = 22;
const INITIAL_SNAKE = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  z: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  q: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};
const TICK_MS = 120;

function randomFood(snake) {
  let cell;
  do {
    cell = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === cell.x && segment.y === cell.y));
  return cell;
}

export default function Snake() {
  const { scores, loading, submitScore } = useLeaderboard("snake");
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(() => randomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(randomFood(INITIAL_SNAKE));
    setDirection({ x: 1, y: 0 });
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }, []);

  useEffect(() => {
    function handleKey(event) {
      const next = DIRECTIONS[event.key];
      if (!next) return;
      event.preventDefault();
      const current = directionRef.current;
      if (current.x + next.x === 0 && current.y + next.y === 0) return;
      nextDirectionRef.current = next;
      if (!running && !gameOver) setRunning(true);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running, gameOver]);

  useEffect(() => {
    if (!running || gameOver) return undefined;
    const interval = setInterval(() => {
      setDirection(nextDirectionRef.current);
      setSnake((prevSnake) => {
        const dir = nextDirectionRef.current;
        const head = {
          x: prevSnake[0].x + dir.x,
          y: prevSnake[0].y + dir.y,
        };

        const hitsWall = head.x < 0 || head.y < 0 || head.x >= GRID_SIZE || head.y >= GRID_SIZE;
        const hitsSelf = prevSnake.some((segment) => segment.x === head.x && segment.y === head.y);

        if (hitsWall || hitsSelf) {
          setRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        const ateFood = head.x === food.x && head.y === food.y;
        const nextSnake = [head, ...prevSnake];
        if (ateFood) {
          setScore((s) => s + 10);
          setFood(randomFood(nextSnake));
        } else {
          nextSnake.pop();
        }
        return nextSnake;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [running, gameOver, food]);

  return (
    <div className="game-shell">
      <div className="game-panel">
        <div className="game-panel-header">
          <h2>🐍 Snake</h2>
          {!running && !gameOver && (
            <button className="btn btn-primary" type="button" onClick={resetGame}>
              Démarrer
            </button>
          )}
        </div>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Longueur</span>
            <span className="stat-value">{snake.length}</span>
          </div>
        </div>
        <div className="game-board-container">
          <div className="game-board-wrap">
            <svg
              width={GRID_SIZE * CELL}
              height={GRID_SIZE * CELL}
              role="img"
              aria-label="Plateau de jeu Snake"
            >
              <rect width="100%" height="100%" fill="var(--bg)" />
              {snake.map((segment, index) => (
                <rect
                  key={`${segment.x}-${segment.y}-${index}`}
                  x={segment.x * CELL + 1}
                  y={segment.y * CELL + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={5}
                  fill={index === 0 ? "var(--accent)" : "var(--accent-dim)"}
                  stroke={index === 0 ? "var(--accent-hover)" : "transparent"}
                />
              ))}
              <rect
                x={food.x * CELL + 3}
                y={food.y * CELL + 3}
                width={CELL - 6}
                height={CELL - 6}
                rx={4}
                fill="var(--red)"
              />
            </svg>
          </div>
          <GameOverOverlay
            visible={gameOver}
            score={score}
            onRestart={resetGame}
            onSubmitScore={(name) => submitScore(name, score)}
          />
        </div>
        <p className="game-controls-hint">Flèches ou Z/Q/S/D pour diriger le serpent.</p>
      </div>
      <Leaderboard scores={scores} loading={loading} title="Meilleurs scores — Snake" />
    </div>
  );
}
