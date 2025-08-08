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

// ICON
import { BackIcon } from "@/components/BackIcon";
import { BKing } from "@/components/chess/black/BKing";
import { WKing } from "@/components/chess/white/WKing";
import { Face } from "@/components/Face";
import { Setting } from "@/components/icons/Setting";

// Chess Game Component
import ChessGame from "@/components/ChessGame";

const STORAGE_KEYS = {
  DIFFICULTY: "chess_difficulty",
  COLOR: "chess_color",
  GAME_SESSION: "chess_game_session",
  GAME_FEN: "chess_game_fen",
};

export default function PlayWithAI() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("Intermediate");
  const [selectedColor, setSelectedColor] = useState<"white" | "black">(
    "white"
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  // Load saved settings on component mount
  useEffect(() => {
    loadSavedSettings();
    checkGameSession();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedDifficulty = await AsyncStorage.getItem(
        STORAGE_KEYS.DIFFICULTY
      );
      const savedColor = await AsyncStorage.getItem(STORAGE_KEYS.COLOR);

      if (savedDifficulty) {
        setSelectedLevel(savedDifficulty);
      }
      if (savedColor) {
        setSelectedColor(savedColor as "white" | "black");
      }
    } catch (error) {
      console.error("Error loading saved settings:", error);
    }
  };

  const checkGameSession = async () => {
    try {
      const gameSession = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SESSION);
      if (gameSession === "active") {
        setGameStarted(true);
      }
    } catch (error) {
      console.error("Error checking game session:", error);
    }
  };

  const saveGameSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DIFFICULTY, selectedLevel);
      await AsyncStorage.setItem(STORAGE_KEYS.COLOR, selectedColor);
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_SESSION, "active");
    } catch (error) {
      console.error("Error saving game settings:", error);
    }
  };

  const clearGameSession = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DIFFICULTY,
        STORAGE_KEYS.COLOR,
        STORAGE_KEYS.GAME_SESSION,
        STORAGE_KEYS.GAME_FEN,
      ]);
    } catch (error) {
      console.error("Error clearing game session:", error);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await saveGameSettings();
      console.log(
        `Starting game with difficulty: ${selectedLevel}, playing as: ${selectedColor}`
      );

      setTimeout(() => {
        setGameStarted(true);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error starting game:", error);
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

  const handleBackPress = () => {
    if (gameStarted) {
      Alert.alert(
        "Quit Game",
        "Are you sure you want to quit? Your game progress will be lost.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Quit",
            style: "destructive",
            onPress: async () => {
              await clearGameSession();
              setGameStarted(false);
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleGameQuit = async () => {
    Alert.alert(
      "Quit Game",
      "Are you sure you want to quit? Your game progress will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Quit",
          style: "destructive",
          onPress: async () => {
            await clearGameSession();
            setGameStarted(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-lg text-gray-700 mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (gameStarted) {
    return <ChessGame onQuit={handleGameQuit} onBack={handleBackPress} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-4 pt-14">
        {/* NAVBAR */}
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
          <TouchableOpacity className="w-10 h-10 justify-center items-center">
            <Setting height={30} width={30} color="#000" />
          </TouchableOpacity>
        </View>

        {/* WELCOME */}
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
          {/* Difficulty Dropdown */}
          <TouchableOpacity
            onPress={() => setDropdownVisible(true)}
            className="bg-white rounded-full w-56 justify-center border border-gray-300 px-4 py-3 flex-row items-center mr-4 shadow-sm"
          >
            <Text className="text-gray-700 text-base mr-2">
              {selectedLevel}
            </Text>
            <Text className="text-gray-400 text-xs">▼</Text>
          </TouchableOpacity>

          {/* Color Selection */}
          <View className="flex-row space-x-2 gap-4">
            <TouchableOpacity
              onPress={() => handleColorSelect("white")}
              className={`w-12 h-12 ${
                selectedColor === "white"
                  ? "bg-indigo-500 border-0 "
                  : "bg-gray-200 border-2 border-transparent"
              } rounded-full justify-center items-center shadow-sm`}
            >
              <WKing height={30} width={30} color="#ffff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleColorSelect("black")}
              className={`w-12 h-12 ${
                selectedColor === "black"
                  ? "bg-indigo-500 border-0"
                  : "bg-gray-200 border-2 border-transparent"
              } rounded-full justify-center items-center shadow-sm`}
            >
              <BKing height={30} width={30} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStart}
          className="bg-indigo-600 py-4 rounded-2xl shadow-lg active:bg-indigo-700"
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {loading ? "Starting..." : "Start Game"}
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
                    {item}
                  </Text>
                  {selectedLevel === item && (
                    <Text className="text-indigo-600 text-lg">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
