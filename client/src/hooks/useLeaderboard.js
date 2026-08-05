import { useCallback, useEffect, useState } from "react";
import { getScores, postScore } from "../api.js";

export function useLeaderboard(game) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getScores(game);
      setScores(data);
    } catch {
      setScores([]);
    } finally {
      setLoading(false);
    }
  }, [game]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitScore = useCallback(
    async (name, score) => {
      await postScore(game, { name, score });
      await refresh();
    },
    [game, refresh]
  );

  return { scores, loading, submitScore, refresh };
}
