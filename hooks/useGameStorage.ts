import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

interface GameSettings {
  difficulty: string;
  color: "white" | "black";
  gameSession: "active" | "inactive";
  gameFen?: string;
}

export const useGameStorage = () => {
  const clearGameSession = useCallback(async () => {
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
      return { success: true };
    } catch (error) {
      console.error("Error clearing game session:", error);
      return { success: false, error };
    }
  }, []);

  const saveGameSettings = useCallback(
    async (settings: Partial<GameSettings>) => {
      try {
        const promises = [];

        if (settings.difficulty) {
          promises.push(
            AsyncStorage.setItem(
              CHESS_STORAGE_KEYS.DIFFICULTY,
              settings.difficulty
            )
          );
        }

        if (settings.color) {
          promises.push(
            AsyncStorage.setItem(CHESS_STORAGE_KEYS.COLOR, settings.color)
          );
        }

        if (settings.gameSession) {
          promises.push(
            AsyncStorage.setItem(
              CHESS_STORAGE_KEYS.GAME_SESSION,
              settings.gameSession
            )
          );
        }

        if (settings.gameFen) {
          promises.push(
            AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_FEN, settings.gameFen)
          );
        }

        await Promise.all(promises);
        return { success: true };
      } catch (error) {
        console.error("Error saving game settings:", error);
        return { success: false, error };
      }
    },
    []
  );

  const loadGameSettings =
    useCallback(async (): Promise<GameSettings | null> => {
      try {
        const [difficulty, color, gameSession, gameFen] = await Promise.all([
          AsyncStorage.getItem(CHESS_STORAGE_KEYS.DIFFICULTY),
          AsyncStorage.getItem(CHESS_STORAGE_KEYS.COLOR),
          AsyncStorage.getItem(CHESS_STORAGE_KEYS.GAME_SESSION),
          AsyncStorage.getItem(CHESS_STORAGE_KEYS.GAME_FEN),
        ]);

        return {
          difficulty: difficulty || "medium",
          color: (color as "white" | "black") || "white",
          gameSession: (gameSession as "active" | "inactive") || "inactive",
          gameFen: gameFen || undefined,
        };
      } catch (error) {
        console.error("Error loading game settings:", error);
        return null;
      }
    }, []);

  const checkGameSession = useCallback(async (): Promise<boolean> => {
    try {
      const gameSession = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.GAME_SESSION
      );
      return gameSession === "active";
    } catch (error) {
      console.error("Error checking game session:", error);
      return false;
    }
  }, []);

  const saveGameId = useCallback(async (gameId: string) => {
    try {
      await AsyncStorage.setItem("game_id", gameId);
      return { success: true };
    } catch (error) {
      console.error("Error saving game ID:", error);
      return { success: false, error };
    }
  }, []);

  const getGameId = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("game_id");
    } catch (error) {
      console.error("Error getting game ID:", error);
      return null;
    }
  }, []);

  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("user_id");
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  }, []);

  const saveMultipleValues = useCallback(
    async (keyValuePairs: Array<[string, string]>) => {
      try {
        await AsyncStorage.multiSet(keyValuePairs);
        return { success: true };
      } catch (error) {
        console.error("Error saving multiple values:", error);
        return { success: false, error };
      }
    },
    []
  );

  return {
    clearGameSession,
    saveGameSettings,
    loadGameSettings,
    checkGameSession,
    saveGameId,
    getGameId,
    getUserId,
    saveMultipleValues,
  };
};
