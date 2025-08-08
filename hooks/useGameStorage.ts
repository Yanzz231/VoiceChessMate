import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  DIFFICULTY: "chess_difficulty",
  COLOR: "chess_color",
  GAME_SESSION: "chess_game_session",
  GAME_FEN: "chess_game_fen",
} as const;

export const useGameStorage = () => {
  const clearGameSession = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DIFFICULTY,
        STORAGE_KEYS.COLOR,
        STORAGE_KEYS.GAME_SESSION,
        STORAGE_KEYS.GAME_FEN,
      ]);
      console.log("Game session cleared successfully");
    } catch (error) {
      console.error("Error clearing game session:", error);
    }
  };

  const saveGameData = async (
    key: keyof typeof STORAGE_KEYS,
    value: string
  ) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS[key], value);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const getGameData = async (key: keyof typeof STORAGE_KEYS) => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  };

  return {
    clearGameSession,
    saveGameData,
    getGameData,
    STORAGE_KEYS,
  };
};
