import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CHESS_THEMES,
  ChessTheme,
  DEFAULT_THEME,
} from "../constants/chessThemes";
import { CHESS_STORAGE_KEYS } from "../constants/storageKeys";

export class ThemeManager {
  static async loadTheme(): Promise<ChessTheme> {
    try {
      const savedThemeId = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.THEME);
      if (savedThemeId) {
        const theme = CHESS_THEMES.find((t) => t.id === savedThemeId);
        return theme || DEFAULT_THEME;
      }
      return DEFAULT_THEME;
    } catch (error) {
      console.error("Error loading theme:", error);
      return DEFAULT_THEME;
    }
  }

  static async saveTheme(theme: ChessTheme): Promise<boolean> {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.THEME, theme.id);
      return true;
    } catch (error) {
      console.error("Error saving theme:", error);
      return false;
    }
  }

  static getThemeById(themeId: string): ChessTheme {
    return CHESS_THEMES.find((t) => t.id === themeId) || DEFAULT_THEME;
  }

  static getAllThemes(): ChessTheme[] {
    return CHESS_THEMES;
  }

  static async resetToDefault(): Promise<ChessTheme> {
    await this.saveTheme(DEFAULT_THEME);
    return DEFAULT_THEME;
  }

  static getRandomTheme(currentThemeId?: string): ChessTheme {
    const availableThemes = currentThemeId
      ? CHESS_THEMES.filter((t) => t.id !== currentThemeId)
      : CHESS_THEMES;

    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    return availableThemes[randomIndex];
  }

  static isDarkTheme(theme: ChessTheme): boolean {
    return theme.id === "dark";
  }

  static getSquareColor(
    theme: ChessTheme,
    isLight: boolean,
    isSelected: boolean,
    isLastMove: boolean
  ): string {
    if (isSelected) return theme.selectedSquare;
    if (isLastMove) return theme.lastMoveSquare;
    return isLight ? theme.lightSquare : theme.darkSquare;
  }
}
