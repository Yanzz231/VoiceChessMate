import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import { userService } from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";

interface NewGameConfig {
  difficulty: string;
  playerColor: "white" | "black";
  userId?: string;
}

export const useGameInitialization = () => {
  const [loading, setLoading] = useState(false);

  const createNewGame = useCallback(
    async ({
      difficulty,
      playerColor,
      userId,
    }: NewGameConfig): Promise<{
      success: boolean;
      gameId?: string;
      message?: string;
    }> => {
      setLoading(true);

      try {
        await AsyncStorage.multiRemove([
          CHESS_STORAGE_KEYS.GAME_STATES,
          CHESS_STORAGE_KEYS.CURRENT_STATE_INDEX,
          CHESS_STORAGE_KEYS.GAME_SESSION,
          CHESS_STORAGE_KEYS.DIFFICULTY,
          CHESS_STORAGE_KEYS.COLOR,
          CHESS_STORAGE_KEYS.GAME_FEN,
          "game_id",
        ]);

        const currentUserId = userId || (await AsyncStorage.getItem("user_id"));

        if (!currentUserId) {
          return {
            success: false,
            message: "User not found. Please login again.",
          };
        }

        const gameId = await userService.createGame(currentUserId);

        if (!gameId) {
          return {
            success: false,
            message: "Failed to create new game. Please try again.",
          };
        }

        await Promise.all([
          AsyncStorage.setItem("game_id", gameId),
          AsyncStorage.setItem(CHESS_STORAGE_KEYS.DIFFICULTY, difficulty),
          AsyncStorage.setItem(CHESS_STORAGE_KEYS.COLOR, playerColor),
          AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_SESSION, "active"),
        ]);

        return {
          success: true,
          gameId,
        };
      } catch (error) {
        console.error("Error creating new game:", error);
        return {
          success: false,
          message: "Failed to start new game. Please try again.",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resumeGame = useCallback(async (): Promise<{
    success: boolean;
    gameData?: {
      gameId: string;
      difficulty: string;
      playerColor: "white" | "black";
    };
    message?: string;
  }> => {
    try {
      const [gameId, difficulty, color, gameSession] = await Promise.all([
        AsyncStorage.getItem("game_id"),
        AsyncStorage.getItem(CHESS_STORAGE_KEYS.DIFFICULTY),
        AsyncStorage.getItem(CHESS_STORAGE_KEYS.COLOR),
        AsyncStorage.getItem(CHESS_STORAGE_KEYS.GAME_SESSION),
      ]);

      if (gameSession === "active" && gameId && difficulty && color) {
        return {
          success: true,
          gameData: {
            gameId,
            difficulty,
            playerColor: color as "white" | "black",
          },
        };
      }

      return {
        success: false,
        message: "No active game session found.",
      };
    } catch (error) {
      console.error("Error resuming game:", error);
      return {
        success: false,
        message: "Failed to resume game.",
      };
    }
  }, []);

  return {
    loading,
    createNewGame,
    resumeGame,
  };
};
