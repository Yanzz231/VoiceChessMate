import {
  DEFAULT_PIECE_THEME,
  PIECE_THEMES,
  PieceTheme,
} from "@/constants/chessPieceThemes";
import {
  CHESS_THEMES,
  ChessTheme,
  DEFAULT_THEME,
} from "@/constants/chessThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const useChessSettings = () => {
  const [currentTheme, setCurrentTheme] = useState<ChessTheme>(DEFAULT_THEME);
  const [currentPieceTheme, setCurrentPieceTheme] =
    useState<PieceTheme>(DEFAULT_PIECE_THEME);
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.THEME);
      if (savedThemeId) {
        const theme =
          CHESS_THEMES.find((t) => t.id === savedThemeId) || DEFAULT_THEME;
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const loadPieceTheme = async () => {
    try {
      const savedPieceThemeId = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.PIECE_THEME
      );
      if (savedPieceThemeId) {
        const theme =
          PIECE_THEMES.find((t) => t.id === savedPieceThemeId) ||
          DEFAULT_PIECE_THEME;
        setCurrentPieceTheme(theme);
      }
    } catch (error) {
      console.error("Error loading piece theme:", error);
    }
  };

  const saveTheme = async (theme: ChessTheme) => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.THEME, theme.id);
      setCurrentTheme(theme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const savePieceTheme = async (theme: PieceTheme) => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.PIECE_THEME, theme.id);
      setCurrentPieceTheme(theme);
    } catch (error) {
      console.error("Error saving piece theme:", error);
    }
  };

  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadTheme(), loadPieceTheme()]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  return {
    currentTheme,
    currentPieceTheme,
    isLoading,
    setCurrentTheme: saveTheme,
    setCurrentPieceTheme: savePieceTheme,
    loadTheme,
    loadPieceTheme,
    loadAllSettings,
  };
};
