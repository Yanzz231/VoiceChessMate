import { ChessTheme, DEFAULT_THEME } from "@/constants/chessThemes";
import { ThemeManager } from "@/utils/themeUtils";
import { useCallback, useEffect, useState } from "react";

export const useChessTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ChessTheme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    setIsLoading(true);
    try {
      const theme = await ThemeManager.loadTheme();
      setCurrentTheme(theme);
    } catch (error) {
      console.error("Error loading theme:", error);
      setCurrentTheme(DEFAULT_THEME);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = useCallback(async (theme: ChessTheme) => {
    try {
      const success = await ThemeManager.saveTheme(theme);
      if (success) {
        setCurrentTheme(theme);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error changing theme:", error);
      return false;
    }
  }, []);

  const resetTheme = useCallback(async () => {
    try {
      const defaultTheme = await ThemeManager.resetToDefault();
      setCurrentTheme(defaultTheme);
      return true;
    } catch (error) {
      console.error("Error resetting theme:", error);
      return false;
    }
  }, []);

  const getRandomTheme = useCallback(() => {
    return ThemeManager.getRandomTheme(currentTheme.id);
  }, [currentTheme.id]);

  const getSquareColor = useCallback(
    (
      isLight: boolean,
      isSelected: boolean = false,
      isLastMove: boolean = false
    ) => {
      return ThemeManager.getSquareColor(
        currentTheme,
        isLight,
        isSelected,
        isLastMove
      );
    },
    [currentTheme]
  );

  return {
    currentTheme,
    isLoading,
    changeTheme,
    resetTheme,
    getRandomTheme,
    getSquareColor,
    isDarkTheme: ThemeManager.isDarkTheme(currentTheme),
  };
};
