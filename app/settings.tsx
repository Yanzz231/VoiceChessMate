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
  CHESS_THEMES,
  ChessTheme,
  DEFAULT_THEME,
} from "@/constants/chessThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";

export default function SettingsPage() {
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState<ChessTheme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentTheme();
  }, []);

  const loadCurrentTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.THEME);
      if (savedThemeId) {
        const theme =
          CHESS_THEMES.find((t) => t.id === savedThemeId) || DEFAULT_THEME;
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
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

      {/* Header */}
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
        {/* Current Theme Info */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Current Chess Theme
          </Text>
          <Text className="text-base text-indigo-600 font-medium">
            {currentTheme.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            This theme will be applied to all chess games
          </Text>
        </View>

        {/* Theme Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Choose Chess Board Theme
          </Text>
          {CHESS_THEMES.map((theme) => renderThemePreview(theme))}
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          {/* Reset Theme Button */}
          <TouchableOpacity
            onPress={resetToDefault}
            className="bg-gray-100 rounded-2xl p-4 items-center border border-gray-200"
          >
            <Text className="text-gray-700 font-medium">
              Reset to Default Theme
            </Text>
          </TouchableOpacity>

          {/* Clear All Data Button */}
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
