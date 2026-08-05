import { useState } from "react";

export default function GameOverOverlay({
  visible,
  title = "Partie terminée",
  score,
  onRestart,
  onSubmitScore,
}) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      await onSubmitScore(name.trim() || "Joueur");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="game-overlay">
      <h3>{title}</h3>
      <p>Score final : {score}</p>
      {submitted ? (
        <p style={{ color: "var(--accent)" }}>Score enregistré ✓</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}
        >
          <input
            className="name-input"
            placeholder="Votre nom"
            value={name}
            maxLength={20}
            onChange={(event) => setName(event.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Envoi…" : "Enregistrer le score"}
          </button>
        </form>
      )}
      <button className="btn btn-secondary" onClick={onRestart} type="button">
        Rejouer
      </button>
    </div>
  );
}
