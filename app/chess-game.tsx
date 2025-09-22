import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
import { useGameStorage } from "@/hooks/useGameStorage";
import { useModalManager } from "@/hooks/useModalManager";

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

  const {
    showModal,
    modalData,
    showConfirmModal,
    hideModal,
    handleConfirm,
    handleCancel,
  } = useModalManager();
  const { clearGameSession, loadGameSettings } = useGameStorage();

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
        showConfirmModal({
          title: "Error",
          message: "Failed to initialize game from scanned position.",
          confirmText: "OK",
          onConfirm: () => router.back(),
        });
        setLoading(false);
      }
    } else {
      checkExistingGameSession();
    }
  };

  const checkExistingGameSession = async () => {
    try {
      const settings = await loadGameSettings();

      if (settings) {
        setSelectedColor(settings.color);
        if (settings.gameSession === "active") {
          setGameStarted(true);
        }
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (gameStarted) {
      showConfirmModal({
        title: "Quit Game",
        message:
          "Are you sure you want to quit? Your game progress will be lost.",
        confirmText: "Quit",
        cancelText: "Cancel",
        onConfirm: async () => {
          await clearGameSession();
          setGameStarted(false);
          router.back();
        },
      });
    } else {
      router.back();
    }
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  const handleGameQuit = async () => {
    showConfirmModal({
      title: "Quit Game",
      message:
        "Are you sure you want to quit? Your game progress will be lost.",
      confirmText: "Quit",
      cancelText: "Cancel",
      onConfirm: async () => {
        await clearGameSession();
        setGameStarted(false);
      },
    });
  };

  const renderConfirmModal = () => {
    if (!showModal || !modalData) return null;

    return (
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              {modalData.title}
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6 leading-relaxed">
              {modalData.message}
            </Text>
            <View className="gap-3">
              {modalData.onConfirm && (
                <TouchableOpacity
                  onPress={handleConfirm}
                  className={`py-4 rounded-2xl shadow-lg ${
                    modalData.confirmText === "Quit" ||
                    modalData.confirmText === "OK"
                      ? "bg-red-600 active:bg-red-700"
                      : "bg-indigo-600 active:bg-indigo-700"
                  }`}
                >
                  <Text className="text-white text-lg font-semibold text-center">
                    {modalData.confirmText}
                  </Text>
                </TouchableOpacity>
              )}
              {modalData.onCancel && modalData.cancelText && (
                <TouchableOpacity
                  onPress={handleCancel}
                  className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
                >
                  <Text className="text-gray-700 text-lg font-medium text-center">
                    {modalData.cancelText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
      <>
        <ChessGame
          onQuit={handleGameQuit}
          onBack={handleBackPress}
          playerColor={selectedColor}
          initialFEN={fromScan === "true" ? fen : undefined}
        />
        {renderConfirmModal()}
      </>
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

      {renderConfirmModal()}
    </SafeAreaView>
  );
}
