export default function Leaderboard({ scores, loading, title = "Meilleurs scores" }) {
  return (
    <div className="leaderboard">
      <h3>🏆 {title}</h3>
      {loading ? (
        <p className="leaderboard-empty">Chargement…</p>
      ) : !scores || scores.length === 0 ? (
        <p className="leaderboard-empty">Aucun score pour l'instant. Soyez le premier !</p>
      ) : (
        <ol className="leaderboard-list">
          {scores.map((entry, index) => (
            <li className="leaderboard-item" key={`${entry.name}-${entry.date}-${index}`}>
              <span className="leaderboard-rank">{index + 1}</span>
              <span className="leaderboard-name">{entry.name}</span>
              <span className="leaderboard-score">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
