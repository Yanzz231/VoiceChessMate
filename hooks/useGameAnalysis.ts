import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface GameData {
  GameID: string;
  Date: string;
  MoveAmount: number;
}

interface ApiResponse {
  data: GameData[];
}

interface GameStats {
  totalGames: number;
  avgMoves: number;
  longGames: number;
  quickGames: number;
}

interface UseGameAnalysisResult {
  games: GameData[];
  loading: boolean;
  refreshing: boolean;
  stats: GameStats;
  onRefresh: () => Promise<void>;
  formatDate: (dateString: string) => string;
  getGameDuration: (moveAmount: number) => string;
  getGameStatusColor: (moveAmount: number) => string;
  getGameIcon: (moveAmount: number) => string;
}

export const useGameAnalysis = (): UseGameAnalysisResult => {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadGames = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please login again.");
        return;
      }

      const response = await fetch(
        `https://voicechessmatebe-production.up.railway.app/api/analysis/${userId}/games`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data: ApiResponse = await response.json();
      setGames(data.data || []);
    } catch (error) {
      console.error("Error loading games:", error);
      Alert.alert("Error", "Failed to load game history. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGames();
  }, [loadGames]);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getGameDuration = useCallback((moveAmount: number): string => {
    if (moveAmount < 10) return "Quick Game";
    if (moveAmount < 30) return "Medium Game";
    if (moveAmount < 60) return "Long Game";
    return "Extended Game";
  }, []);

  const getGameStatusColor = useCallback((moveAmount: number): string => {
    return "#374151";
  }, []);

  const getGameIcon = useCallback((moveAmount: number): string => {
    if (moveAmount < 10) return "flash";
    if (moveAmount < 30) return "game-controller";
    if (moveAmount < 60) return "trophy";
    return "star";
  }, []);

  const stats: GameStats = {
    totalGames: games.length,
    avgMoves:
      games.length > 0
        ? Math.round(
            games.reduce((sum, game) => sum + game.MoveAmount, 0) / games.length
          )
        : 0,
    longGames: games.filter((g) => g.MoveAmount >= 20).length,
    quickGames: games.filter((g) => g.MoveAmount < 10).length,
  };

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return {
    games,
    loading,
    refreshing,
    stats,
    onRefresh,
    formatDate,
    getGameDuration,
    getGameStatusColor,
    getGameIcon,
  };
};
