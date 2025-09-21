import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BackIcon } from "@/components/BackIcon";
import { PieceRenderer } from "@/components/chess/PieceRenderer";
import { Face } from "@/components/Face";
import { Setting } from "@/components/icons/Setting";

import ChessGame from "@/components/ChessGame";

import {
  DEFAULT_PIECE_THEME,
  PIECE_THEMES,
} from "@/constants/chessPieceThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import { userService } from "@/services/userService";

export default function PlayWithAI() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("easy");
  const [selectedColor, setSelectedColor] = useState<"white" | "black">(
    "white"
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPieceTheme, setCurrentPieceTheme] =
    useState(DEFAULT_PIECE_THEME);

  const difficultyLevels = ["easy", "medium", "hard"];

  useEffect(() => {
    loadSavedSettings();
    checkGameSession();
    loadPieceTheme();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedDifficulty = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.DIFFICULTY
      );
      const savedColor = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.COLOR);

      if (savedDifficulty) {
        setSelectedLevel(savedDifficulty);
      }
      if (savedColor) {
        setSelectedColor(savedColor as "white" | "black");
      }
    } catch (error) {
      // console.error("Error loading saved settings:", error);
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
      // console.error("Error loading piece theme:", error);
    }
  };

  const checkGameSession = async () => {
    try {
      const gameSession = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.GAME_SESSION
      );
      if (gameSession === "active") {
        setGameStarted(true);
      }
    } catch (error) {
      // console.error("Error checking game session:", error);
    }
  };

  const saveGameSettings = async () => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.DIFFICULTY, selectedLevel);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.COLOR, selectedColor);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_SESSION, "active");
    } catch (error) {
      // console.error("Error saving game settings:", error);
    }
  };

  const clearGameSession = async () => {
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
    } catch (error) {
      // console.error("Error clearing game session:", error);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert("Error", "User not found. Please login again.");
        setLoading(false);
        return;
      }

      const gameId = await userService.createGame(userId);

      if (!gameId) {
        Alert.alert("Error", "Failed to create game. Please try again.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("game_id", gameId);
      await saveGameSettings();

      setTimeout(() => {
        setGameStarted(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      // console.error("Error starting game:", error);
      setLoading(false);
    }
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setDropdownVisible(false);
  };

  const handleColorSelect = (color: "white" | "black") => {
    setSelectedColor(color);
  };

  const handleBackPress = async () => {
    if (gameStarted) {
      await clearGameSession();
      setGameStarted(false);
      router.back();
    } else {
      router.back();
    }
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  const handleGameQuit = async () => {
    await clearGameSession();
    setGameStarted(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-lg text-gray-700 mt-4">Creating game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (gameStarted) {
    return (
      <ChessGame
        onQuit={handleGameQuit}
        onBack={handleBackPress}
        playerColor={selectedColor}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-4 pt-14">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBackPress}
            className="w-10 h-10 justify-center items-center"
          >
            <BackIcon height={30} width={30} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Play with AI
          </Text>
          <TouchableOpacity
            onPress={handleSettingsPress}
            className="w-10 h-10 justify-center items-center"
          >
            <Setting height={30} width={30} color="#000" />
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-6 mb-4">
          <View className="flex-row  gap-4 justify-center items-center">
            <Face height={70} width={70} />

            <View className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100 relative">
              <View className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white" />
              <Text className="text-gray-800 text-base leading-relaxed">
                Welcome back. Nothing like a friendly game to learn new tactics!
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      ></ScrollView>

      <View className="px-6 pb-6 bg-white border-t border-gray-100">
        <View className="flex-row items-center justify-center mb-4 pt-4">
          <TouchableOpacity
            onPress={() => setDropdownVisible(true)}
            className="bg-white rounded-full w-56 justify-center border border-gray-300 px-4 py-3 flex-row items-center mr-4 shadow-sm"
          >
            <Text className="text-gray-700 text-base mr-2">
              {selectedLevel[0].toUpperCase() + selectedLevel.slice(1)}
            </Text>
            <Text className="text-gray-400 text-xs">▼</Text>
          </TouchableOpacity>

          <View className="flex-row space-x-2 gap-4">
            <TouchableOpacity
              onPress={() => handleColorSelect("white")}
              className={`w-12 h-12 ${
                selectedColor === "white"
                  ? "bg-indigo-500 border-0 "
                  : "bg-gray-200 border-2 border-transparent"
              } rounded-full justify-center items-center shadow-sm`}
            >
              <PieceRenderer
                type="k"
                color="w"
                theme={currentPieceTheme.version}
                size={30}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleColorSelect("black")}
              className={`w-12 h-12 ${
                selectedColor === "black"
                  ? "bg-indigo-500 border-0"
                  : "bg-gray-200 border-2 border-transparent"
              } rounded-full justify-center items-center shadow-sm`}
            >
              <PieceRenderer
                type="k"
                color="b"
                theme={currentPieceTheme.version}
                size={30}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStart}
          className="bg-indigo-600 py-4 rounded-2xl shadow-lg active:bg-indigo-700"
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {loading ? "Creating game..." : "Start Game"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View className="bg-white rounded-2xl mx-8 py-2 shadow-xl max-h-80">
            <Text className="text-lg font-semibold text-gray-800 text-center mb-2 px-6 py-2">
              Select Difficulty
            </Text>
            {difficultyLevels.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => handleLevelSelect(item)}
                className={`px-6 py-3 ${
                  selectedLevel === item ? "bg-indigo-50" : ""
                } ${
                  item !== difficultyLevels[difficultyLevels.length - 1]
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-base ${
                      selectedLevel === item
                        ? "text-indigo-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {item[0].toUpperCase() + item.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
