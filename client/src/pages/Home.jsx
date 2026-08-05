const GAMES = [
  {
    id: "snake",
    icon: "🐍",
    title: "Snake",
    description: "Guidez le serpent, mangez les pommes et évitez les murs et votre propre queue.",
  },
  {
    id: "memory",
    icon: "🧠",
    title: "Memory",
    description: "Retrouvez toutes les paires de cartes en un minimum de coups.",
  },
  {
    id: "2048",
    icon: "🔢",
    title: "2048",
    description: "Fusionnez les tuiles pour atteindre la valeur 2048 et au-delà.",
  },
  {
    id: "breakout",
    icon: "🧱",
    title: "Casse-briques",
    description: "Détruisez toutes les briques avec la balle sans la laisser tomber.",
  },
];

export default function Home({ onNavigate }) {
  return (
    <div>
      <section className="hero">
        <span className="hero-eyebrow">Sans compte · Scores en direct</span>
        <h1>Quatre jeux classiques, un seul arcade.</h1>
        <p className="lead">
          Jouez à Snake, Memory, 2048 et Casse-briques directement dans votre navigateur,
          et comparez votre score aux meilleurs joueurs.
        </p>
        <div className="hero-badges">
          <span className="hero-badge">🎮 4 jeux</span>
          <span className="hero-badge">🏆 Classements en direct</span>
          <span className="hero-badge">⚡ Sans installation</span>
        </div>
      </section>

      <h2 className="section-title">Choisissez votre jeu</h2>
      <div className="game-grid">
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            className="game-card"
            onClick={() => onNavigate(game.id)}
          >
            <span className="game-card-icon">{game.icon}</span>
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <span className="game-card-play">Jouer →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
