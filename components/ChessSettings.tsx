import { BackIcon } from "@/components/BackIcon";
import { PieceRenderer } from "@/components/chess/PieceRenderer";
import { Setting } from "@/components/icons/Setting";
import { PIECE_THEMES, PieceTheme } from "@/constants/chessPieceThemes";
import { CHESS_THEMES, ChessTheme } from "@/constants/chessThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChessSettingsProps {
  onBack: () => void;
  currentTheme: ChessTheme;
  onThemeChange: (theme: ChessTheme) => void;
  currentPieceTheme: PieceTheme;
  onPieceThemeChange: (theme: PieceTheme) => void;
}

const ChessSettings: React.FC<ChessSettingsProps> = ({
  onBack,
  currentTheme,
  onThemeChange,
  currentPieceTheme,
  onPieceThemeChange,
}) => {
  const [activeTab, setActiveTab] = useState<"board" | "pieces">("board");

  const handleBoardThemeSelect = async (theme: ChessTheme) => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.THEME, theme.id);
      onThemeChange(theme);
    } catch (error) {
      console.error("Error saving board theme:", error);
    }
  };

  const handlePieceThemeSelect = async (theme: PieceTheme) => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.PIECE_THEME, theme.id);
      onPieceThemeChange(theme);
    } catch (error) {
      console.error("Error saving piece theme:", error);
    }
  };

  const renderBoardThemeOption = (theme: ChessTheme) => {
    const isSelected = currentTheme.id === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        onPress={() => handleBoardThemeSelect(theme)}
        className={`mb-4 p-4 rounded-2xl border-2 ${
          isSelected
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}
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
                        style={{ width: 20, height: 20, backgroundColor }}
                      />
                    );
                  })}
                </View>
              ))}
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

  const renderPieceThemeOption = (theme: PieceTheme) => {
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
            <View className="flex-row items-center gap-4">
              <View className="items-center">
                <PieceRenderer
                  type="k"
                  color="w"
                  theme={theme.version}
                  size={32}
                />
                <Text className="text-xs text-gray-500 mt-1">White</Text>
              </View>
              <View className="items-center">
                <PieceRenderer
                  type="q"
                  color="w"
                  theme={theme.version}
                  size={32}
                />
              </View>
              <View className="items-center">
                <PieceRenderer
                  type="r"
                  color="w"
                  theme={theme.version}
                  size={32}
                />
              </View>
              <View className="items-center">
                <PieceRenderer
                  type="k"
                  color="b"
                  theme={theme.version}
                  size={32}
                />
                <Text className="text-xs text-gray-500 mt-1">Black</Text>
              </View>
              <View className="items-center">
                <PieceRenderer
                  type="q"
                  color="b"
                  theme={theme.version}
                  size={32}
                />
              </View>
              <View className="items-center">
                <PieceRenderer
                  type="r"
                  color="b"
                  theme={theme.version}
                  size={32}
                />
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-4 pt-14 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 justify-center items-center"
          >
            <BackIcon height={30} width={30} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-semibold text-gray-800">
              Chess Settings
            </Text>
            <Text className="text-sm text-gray-500">Customize your game</Text>
          </View>
          <View className="w-10 h-10 justify-center items-center">
            <Setting height={30} width={30} color="#6366f1" />
          </View>
        </View>
      </View>

      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab("board")}
            className={`flex-1 py-3 items-center rounded-lg mr-2 ${
              activeTab === "board" ? "bg-indigo-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-medium ${
                activeTab === "board" ? "text-indigo-700" : "text-gray-600"
              }`}
            >
              Board Theme
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("pieces")}
            className={`flex-1 py-3 items-center rounded-lg ml-2 ${
              activeTab === "pieces" ? "bg-indigo-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-medium ${
                activeTab === "pieces" ? "text-indigo-700" : "text-gray-600"
              }`}
            >
              Piece Style
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {activeTab === "board" ? (
          <View>
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Choose Board Theme
            </Text>
            {CHESS_THEMES.map(renderBoardThemeOption)}
          </View>
        ) : (
          <View>
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Choose Piece Style
            </Text>
            {PIECE_THEMES.map(renderPieceThemeOption)}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChessSettings;
