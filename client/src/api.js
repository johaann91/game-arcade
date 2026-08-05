const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.errors?.join(" ") || data?.error || "Une erreur est survenue.";
    throw new Error(message);
  }
  return data;
}

export function getScores(game) {
  return request(`/api/scores/${game}`);
}

export function postScore(game, { name, score }) {
  return request(`/api/scores/${game}`, {
    method: "POST",
    body: JSON.stringify({ name, score }),
  });
}
