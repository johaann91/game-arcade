const NAV_ITEMS = [
  { id: "home", label: "Accueil" },
  { id: "snake", label: "Snake" },
  { id: "memory", label: "Memory" },
  { id: "2048", label: "2048" },
  { id: "breakout", label: "Casse-briques" },
];

export default function Header({ current, onNavigate }) {
  return (
    <header className="app-header">
      <button className="brand" onClick={() => onNavigate("home")} type="button">
        <span className="brand-mark">🕹️</span>
        Game <span className="brand-accent">Arcade</span>
      </button>
      <nav className="app-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link ${current === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
