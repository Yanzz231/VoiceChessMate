import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
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
import {
  CHESS_THEMES,
  ChessTheme,
  DEFAULT_THEME,
} from "@/constants/chessThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";

interface ChessSettingsProps {
  onBack: () => void;
  currentTheme: ChessTheme;
  onThemeChange: (theme: ChessTheme) => void;
}

const ChessSettings: React.FC<ChessSettingsProps> = ({
  onBack,
  currentTheme,
  onThemeChange,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ChessTheme>(currentTheme);

  const handleThemeSelect = async (theme: ChessTheme) => {
    try {
      setSelectedTheme(theme);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.THEME, theme.id);
      onThemeChange(theme);
    } catch (error) {
      console.error("Error saving theme:", error);
      Alert.alert("Error", "Failed to save theme selection");
    }
  };

  const resetToDefault = async () => {
    Alert.alert(
      "Reset Theme",
      "Are you sure you want to reset to the default theme?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await handleThemeSelect(DEFAULT_THEME);
          },
        },
      ]
    );
  };

  const renderThemePreview = (theme: ChessTheme) => {
    const isSelected = selectedTheme.id === theme.id;

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

            {/* Chess board preview */}
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
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
            <Text className="text-sm text-gray-500">Customize your board</Text>
          </View>
          <View className="w-10 h-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Current Theme Info */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Current Theme
          </Text>
          <Text className="text-base text-indigo-600 font-medium">
            {selectedTheme.name}
          </Text>
        </View>

        {/* Theme Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Choose Board Theme
          </Text>
          {CHESS_THEMES.map((theme) => renderThemePreview(theme))}
        </View>

        <TouchableOpacity
          onPress={resetToDefault}
          className="bg-gray-100 rounded-2xl p-4 items-center"
        >
          <Text className="text-gray-700 font-medium">
            Reset to Default Theme
          </Text>
        </TouchableOpacity>

        <View className="mt-6 p-4 bg-blue-50 rounded-2xl">
          <Text className="text-sm text-blue-800 text-center">
            Your theme preference will be saved automatically and applied to all
            future games.
          </Text>
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChessSettings;
