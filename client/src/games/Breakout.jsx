import { useCallback, useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard.jsx";
import GameOverOverlay from "../components/GameOverOverlay.jsx";
import { useLeaderboard } from "../hooks/useLeaderboard.js";

const WIDTH = 480;
const HEIGHT = 420;
const PADDLE_WIDTH = 84;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 7;
const ROWS = 5;
const COLS = 8;
const BRICK_WIDTH = 52;
const BRICK_HEIGHT = 18;
const BRICK_GAP = 6;
const BRICK_TOP = 40;
const BRICK_COLORS = ["#ec1c2e", "#ff8a3d", "#f5d020", "#1ed760", "#0a2f6e"];

function buildBricks() {
  const bricks = [];
  const totalWidth = COLS * BRICK_WIDTH + (COLS - 1) * BRICK_GAP;
  const offsetX = (WIDTH - totalWidth) / 2;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      bricks.push({
        x: offsetX + col * (BRICK_WIDTH + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        alive: true,
        color: BRICK_COLORS[row % BRICK_COLORS.length],
        points: (ROWS - row) * 10,
      });
    }
  }
  return bricks;
}

function initialBallState() {
  return {
    x: WIDTH / 2,
    y: HEIGHT - 60,
    vx: 2.6,
    vy: -3.2,
  };
}

export default function Breakout() {
  const { scores, loading, submitScore } = useLeaderboard("breakout");
  const canvasRef = useRef(null);
  const stateRef = useRef({
    paddleX: WIDTH / 2 - PADDLE_WIDTH / 2,
    ball: initialBallState(),
    bricks: buildBricks(),
    running: false,
  });
  const keysRef = useRef({ left: false, right: false });

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState("idle"); // idle | playing | won | lost
  const [, forceRender] = useState(0);

  const resetGame = useCallback(() => {
    stateRef.current = {
      paddleX: WIDTH / 2 - PADDLE_WIDTH / 2,
      ball: initialBallState(),
      bricks: buildBricks(),
      running: true,
    };
    setScore(0);
    setLives(3);
    setStatus("playing");
    forceRender((n) => n + 1);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowLeft" || event.key === "q") keysRef.current.left = true;
      if (event.key === "ArrowRight" || event.key === "d") keysRef.current.right = true;
    }
    function handleKeyUp(event) {
      if (event.key === "ArrowLeft" || event.key === "q") keysRef.current.left = false;
      if (event.key === "ArrowRight" || event.key === "d") keysRef.current.right = false;
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let animationId;

    function draw() {
      const state = stateRef.current;

      if (state.running) {
        if (keysRef.current.left) state.paddleX -= 6;
        if (keysRef.current.right) state.paddleX += 6;
        state.paddleX = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, state.paddleX));

        const ball = state.ball;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - BALL_RADIUS < 0 || ball.x + BALL_RADIUS > WIDTH) {
          ball.vx *= -1;
          ball.x = Math.max(BALL_RADIUS, Math.min(WIDTH - BALL_RADIUS, ball.x));
        }
        if (ball.y - BALL_RADIUS < 0) {
          ball.vy *= -1;
          ball.y = BALL_RADIUS;
        }

        const paddleY = HEIGHT - 24;
        if (
          ball.y + BALL_RADIUS >= paddleY &&
          ball.y + BALL_RADIUS <= paddleY + PADDLE_HEIGHT &&
          ball.x >= state.paddleX &&
          ball.x <= state.paddleX + PADDLE_WIDTH &&
          ball.vy > 0
        ) {
          const hitPos = (ball.x - (state.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
          ball.vx = hitPos * 4.2;
          ball.vy = -Math.abs(ball.vy);
        }

        for (const brick of state.bricks) {
          if (!brick.alive) continue;
          if (
            ball.x + BALL_RADIUS > brick.x &&
            ball.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
            ball.y + BALL_RADIUS > brick.y &&
            ball.y - BALL_RADIUS < brick.y + BRICK_HEIGHT
          ) {
            brick.alive = false;
            ball.vy *= -1;
            setScore((s) => s + brick.points);
            break;
          }
        }

        if (ball.y - BALL_RADIUS > HEIGHT) {
          setLives((prevLives) => {
            const remaining = prevLives - 1;
            if (remaining <= 0) {
              state.running = false;
              setStatus("lost");
            } else {
              state.ball = initialBallState();
            }
            return Math.max(0, remaining);
          });
        }

        if (state.bricks.every((brick) => !brick.alive)) {
          state.running = false;
          setStatus("won");
        }
      }

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (const brick of state.bricks) {
        if (!brick.alive) continue;
        ctx.fillStyle = brick.color;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 4);
        ctx.fill();
      }

      ctx.fillStyle = "#1ed760";
      ctx.beginPath();
      ctx.roundRect(state.paddleX, HEIGHT - 24, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
      ctx.fill();

      ctx.fillStyle = "#f5f5f7";
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const isOver = status === "won" || status === "lost";

  return (
    <div className="game-shell">
      <div className="game-panel">
        <div className="game-panel-header">
          <h2>🧱 Casse-briques</h2>
          {status === "idle" && (
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
            <span className="stat-label">Vies</span>
            <span className="stat-value">{"❤️".repeat(lives) || "—"}</span>
          </div>
        </div>
        <div className="game-board-container">
          <div className="game-board-wrap">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
          </div>
          <GameOverOverlay
            visible={isOver}
            title={status === "won" ? "Toutes les briques détruites !" : "Partie terminée"}
            score={score}
            onRestart={resetGame}
            onSubmitScore={(name) => submitScore(name, score)}
          />
        </div>
        <p className="game-controls-hint">Flèches gauche/droite ou Q/D pour déplacer la raquette.</p>
      </div>
      <Leaderboard scores={scores} loading={loading} title="Meilleurs scores — Casse-briques" />
    </div>
  );
}
