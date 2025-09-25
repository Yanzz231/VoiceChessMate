import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface MoveData {
  move: string;
  fen: string;
  best_move: string;
  eval_graph: number;
  is_eval_mate: boolean;
  move_grade: string;
}

interface ApiResponse {
  data: MoveData;
}

interface UseGameDetailResult {
  currentMove: number;
  totalMoves: number;
  moveData: MoveData | null;
  loading: boolean;
  error: string | null;
  goToMove: (moveNumber: number) => Promise<void>;
  nextMove: () => Promise<void>;
  prevMove: () => Promise<void>;
  goToStart: () => Promise<void>;
  goToEnd: () => Promise<void>;
}

export const useGameDetail = (
  gameId: string,
  totalMovesFromAnalysis?: number
): UseGameDetailResult => {
  const [currentMove, setCurrentMove] = useState(1);
  const [totalMoves, setTotalMoves] = useState(0);
  const [moveData, setMoveData] = useState<MoveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoveData = useCallback(
    async (moveNumber: number) => {
      if (moveNumber < 1) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://voicechessmatebe-production.up.railway.app/api/analysis/game/${gameId}/move/${moveNumber}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch move data: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        const enhancedMoveData: MoveData = {
          move: data.data.move || "",
          fen: data.data.fen || "",
          best_move: data.data.best_move || "",
          eval_graph: data.data.eval_graph ?? 0,
          is_eval_mate: data.data.is_eval_mate ?? false,
          move_grade: data.data.move_grade || "Good",
        };

        setMoveData(enhancedMoveData);

        console.log(`Move ${moveNumber} analysis:`, {
          evaluation: enhancedMoveData.eval_graph,
          isMate: enhancedMoveData.is_eval_mate,
          grade: enhancedMoveData.move_grade,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load move data";
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
        console.error("Error fetching move data:", err);
      } finally {
        setLoading(false);
      }
    },
    [gameId]
  );

  const fetchGameInfo = useCallback(async () => {
    try {
      if (totalMovesFromAnalysis && totalMovesFromAnalysis > 0) {
        setTotalMoves(totalMovesFromAnalysis);
        await fetchMoveData(1);
        setCurrentMove(1);
        return;
      }

      await fetchMoveData(1);

      let maxMove = 1;
      for (let i = 2; i <= 50; i++) {
        try {
          const response = await fetch(
            `https://voicechessmatebe-production.up.railway.app/api/analysis/game/${gameId}/move/${i}`
          );
          if (response.ok) {
            maxMove = i;
          } else {
            break;
          }
        } catch {
          break;
        }
      }

      setTotalMoves(maxMove);
      setCurrentMove(1);
    } catch (err) {
      console.error("Error fetching game info:", err);
      Alert.alert("Error", "Failed to load game information");
    }
  }, [gameId, totalMovesFromAnalysis, fetchMoveData]);

  const goToMove = useCallback(
    async (moveNumber: number) => {
      if (moveNumber < 1 || moveNumber > totalMoves) return;

      setCurrentMove(moveNumber);
      await fetchMoveData(moveNumber);
    },
    [totalMoves, fetchMoveData]
  );

  const nextMove = useCallback(async () => {
    if (currentMove < totalMoves) {
      await goToMove(currentMove + 1);
    }
  }, [currentMove, totalMoves, goToMove]);

  const prevMove = useCallback(async () => {
    if (currentMove > 1) {
      await goToMove(currentMove - 1);
    }
  }, [currentMove, goToMove]);

  const goToStart = useCallback(async () => {
    await goToMove(1);
  }, [goToMove]);

  const goToEnd = useCallback(async () => {
    await goToMove(totalMoves);
  }, [totalMoves, goToMove]);

  useEffect(() => {
    if (gameId) {
      fetchGameInfo();
    }
  }, [gameId, fetchGameInfo]);

  return {
    currentMove,
    totalMoves,
    moveData,
    loading,
    error,
    goToMove,
    nextMove,
    prevMove,
    goToStart,
    goToEnd,
  };
};
