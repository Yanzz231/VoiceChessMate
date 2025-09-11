import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BackIcon } from "@/components/BackIcon";
import { Setting } from "@/components/icons/Setting";
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

export default function SettingsPage() {
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState<ChessTheme>(DEFAULT_THEME);
  const [currentPieceTheme, setCurrentPieceTheme] =
    useState<PieceTheme>(DEFAULT_PIECE_THEME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedThemeId, savedPieceThemeId] = await Promise.all([
        AsyncStorage.getItem(CHESS_STORAGE_KEYS.THEME),
        AsyncStorage.getItem(CHESS_STORAGE_KEYS.PIECE_THEME),
      ]);

      if (savedThemeId) {
        const theme =
          CHESS_THEMES.find((t) => t.id === savedThemeId) || DEFAULT_THEME;
        setCurrentTheme(theme);
      }

      if (savedPieceThemeId) {
        const pieceTheme =
          PIECE_THEMES.find((t) => t.id === savedPieceThemeId) ||
          DEFAULT_PIECE_THEME;
        setCurrentPieceTheme(pieceTheme);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeSelect = async (theme: ChessTheme) => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.THEME, theme.id);
      setCurrentTheme(theme);
    } catch (error) {
      console.error("Error saving theme:", error);
      Alert.alert("Error", "Failed to save theme selection");
    }
  };

  const handlePieceThemeSelect = async (theme: PieceTheme) => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.PIECE_THEME, theme.id);
      setCurrentPieceTheme(theme);
    } catch (error) {
      console.error("Error saving piece theme:", error);
      Alert.alert("Error", "Failed to save piece theme selection");
    }
  };

  const resetToDefault = async () => {
    Alert.alert(
      "Reset Themes",
      "Are you sure you want to reset to the default themes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await handleThemeSelect(DEFAULT_THEME);
            await handlePieceThemeSelect(DEFAULT_PIECE_THEME);
          },
        },
      ]
    );
  };

  const clearAllData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all your game history, settings, and preferences. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setCurrentTheme(DEFAULT_THEME);
              setCurrentPieceTheme(DEFAULT_PIECE_THEME);
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  const renderThemePreview = (theme: ChessTheme) => {
    const isSelected = currentTheme.id === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        onPress={() => handleThemeSelect(theme)}
        className={`mb-4 p-4 rounded-2xl border-2 ${
          isSelected
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className={`text-lg font-semibold mb-2 ${
                isSelected ? "text-indigo-700" : "text-gray-800"
              }`}
            >
              {theme.name}
            </Text>

            <View className="flex-row mb-3">
              {[0, 1, 2, 3].map((row) => (
                <View key={row} className="flex-col">
                  {[0, 1, 2, 3].map((col) => {
                    const isLight = (row + col) % 2 === 0;
                    const backgroundColor = isLight
                      ? theme.lightSquare
                      : theme.darkSquare;

                    return (
                      <View
                        key={`${row}-${col}`}
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor,
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.lightSquare }}
                />
                <Text className="text-sm text-gray-600">Light</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.darkSquare }}
                />
                <Text className="text-sm text-gray-600">Dark</Text>
              </View>
            </View>
          </View>

          {isSelected && (
            <View className="w-8 h-8 bg-indigo-500 rounded-full items-center justify-center ml-4">
              <Text className="text-white font-bold text-lg">✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPieceThemePreview = (theme: PieceTheme) => {
    const isSelected = currentPieceTheme.id === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        onPress={() => handlePieceThemeSelect(theme)}
        className={`mb-4 p-4 rounded-2xl border-2 ${
          isSelected
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className={`text-lg font-semibold mb-3 ${
                isSelected ? "text-indigo-700" : "text-gray-800"
              }`}
            >
              {theme.name}
            </Text>
            <Text className="text-sm text-gray-500 mb-4">
              {theme.version === "v1"
                ? "Classic stroke style"
                : "Modern filled style"}
            </Text>

            <View className="flex-row items-center gap-3">
              {["k", "q", "r", "b", "n", "p"].map((pieceType, index) => {
                const pieceNames = [
                  "King",
                  "Queen",
                  "Rook",
                  "Bishop",
                  "Knight",
                  "Pawn",
                ];
                const PreviewPiece = () => {
                  if (theme.version === "v1") {
                    const V1Components = {
                      k: require("@/components/chess/ChessKingV1").KingV1,
                      q: require("@/components/chess/ChessQueenV1").QueenV1,
                      r: require("@/components/chess/ChessRookV1").RookV1,
                      b: require("@/components/chess/ChessBishopV1").BishopV1,
                      n: require("@/components/chess/ChessHorseV1").HorseV1,
                      p: require("@/components/chess/ChessPawnV1").PawnV1,
                    };
                    const Component =
                      V1Components[pieceType as keyof typeof V1Components];
                    return <Component width={28} height={28} color="#000000" />;
                  } else {
                    const V2Components = {
                      k: require("@/components/chess/ChessKingV1").KingV1,
                      q: require("@/components/chess/ChessQueenV2").QueenV2,
                      r: require("@/components/chess/ChessRookV2").RookV2,
                      b: require("@/components/chess/ChessBishopV2").BishopV2,
                      n: require("@/components/chess/ChessHorseV2").HorseV2,
                      p: require("@/components/chess/ChessPawnV2").PawnV2,
                    };
                    const Component =
                      V2Components[pieceType as keyof typeof V2Components];
                    return <Component width={28} height={28} color="#000000" />;
                  }
                };

                return (
                  <View key={pieceType} className="items-center">
                    <PreviewPiece />
                    <Text className="text-xs text-gray-500 mt-1">
                      {pieceNames[index]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {isSelected && (
            <View className="w-8 h-8 bg-indigo-500 rounded-full items-center justify-center ml-4">
              <Text className="text-white font-bold text-lg">✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-4 pt-14 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 justify-center items-center"
          >
            <BackIcon height={30} width={30} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-semibold text-gray-800">
              Settings
            </Text>
            <Text className="text-sm text-gray-500">
              Customize your app experience
            </Text>
          </View>
          <View className="w-10 h-10 justify-center items-center">
            <Setting height={30} width={30} color="#6366f1" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Current Settings
          </Text>
          <View className="space-y-2">
            <View className="mb-2">
              <Text className="text-sm text-gray-500">Board Theme</Text>
              <Text className="text-base text-indigo-600 font-medium">
                {currentTheme.name}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-500">Piece Style</Text>
              <Text className="text-base text-indigo-600 font-medium">
                {currentPieceTheme.name}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Choose Chess Board Theme
          </Text>
          {CHESS_THEMES.map((theme) => renderThemePreview(theme))}
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Choose Piece Style
          </Text>
          {PIECE_THEMES.map((theme) => renderPieceThemePreview(theme))}
        </View>

        <View className="gap-4">
          <TouchableOpacity
            onPress={resetToDefault}
            className="bg-gray-100 rounded-2xl p-4 items-center border border-gray-200"
          >
            <Text className="text-gray-700 font-medium">
              Reset to Default Themes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearAllData}
            className="bg-red-50 rounded-2xl p-4 items-center border border-red-200"
          >
            <Text className="text-red-600 font-medium">Clear All Data</Text>
            <Text className="text-red-500 text-sm mt-1">
              This will delete all game history and settings
            </Text>
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
