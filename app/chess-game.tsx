import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BackIcon } from "@/components/BackIcon";
import ChessGame from "@/components/ChessGame";
import { Setting } from "@/components/icons/Setting";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";

export default function ChessGameScreen() {
  const router = useRouter();
  const { fromScan, fen } = useLocalSearchParams<{
    fromScan?: string;
    fen?: string;
  }>();

  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<"white" | "black">(
    "white"
  );

  useEffect(() => {
    initializeGameFromScan();
  }, []);

  const initializeGameFromScan = async () => {
    if (fromScan === "true" && fen) {
      try {
        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_FEN, fen);
        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.DIFFICULTY, "medium");
        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.COLOR, "white");
        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_SESSION, "active");

        setGameStarted(true);
        setLoading(false);
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to initialize game from scanned position."
        );
        setLoading(false);
        router.back();
      }
    } else {
      checkExistingGameSession();
    }
  };

  const checkExistingGameSession = async () => {
    try {
      const gameSession = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.GAME_SESSION
      );
      const savedColor = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.COLOR);
      await AsyncStorage.getItem(CHESS_STORAGE_KEYS.DIFFICULTY);

      if (savedColor) setSelectedColor(savedColor as "white" | "black");

      if (gameSession === "active") {
        setGameStarted(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
    } catch (error) {}
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

  const handleSettingsPress = () => {
    router.push("/settings");
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
          <Text className="text-lg text-gray-700 mt-4">
            {fromScan === "true"
              ? "Loading scanned position..."
              : "Loading game..."}
          </Text>
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
        initialFEN={fromScan === "true" ? fen : undefined}
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
            Chess Game
          </Text>
          <TouchableOpacity
            onPress={handleSettingsPress}
            className="w-10 h-10 justify-center items-center"
          >
            <Setting height={30} width={30} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-8 shadow-lg max-w-sm w-full">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            Game Not Active
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6 leading-relaxed">
            No active game session found. Please start a new game or scan a
            chess board position.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/play")}
            className="bg-indigo-600 py-4 rounded-2xl shadow-lg active:bg-indigo-700 mb-3"
          >
            <Text className="text-white text-lg font-semibold text-center">
              Start New Game
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/scan")}
            className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
          >
            <Text className="text-gray-700 text-lg font-medium text-center">
              Scan Chess Board
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
