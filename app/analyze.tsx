import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGameAnalysis } from "@/hooks/useGameAnalysis";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface GameData {
  GameID: string;
  Date: string;
  MoveAmount: number;
}

export default function AnalysisScreen() {
  const {
    games,
    loading,
    refreshing,
    stats,
    onRefresh,
    formatDate,
    getGameDuration,
    getGameIcon,
  } = useGameAnalysis();

  const { processVoiceCommand } = useVoiceNavigation({
    onNavigationStart: (screen) => {
      let navigationMessage = "";
      switch (screen) {
        case "play":
          navigationMessage = "Opening game";
          break;
        case "scan":
          navigationMessage = "Opening camera";
          break;
        case "lesson":
          navigationMessage = "Opening lessons";
          break;
        case "analyze":
          navigationMessage = "Opening analysis";
          break;
        case "setting":
          navigationMessage = "Opening settings";
          break;
        default:
          navigationMessage = "Starting navigation";
      }

      Speech.speak(navigationMessage, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    },
  });

  const handleTranscriptComplete = useCallback(
    async (result: any) => {
      if (result?.text) {
        const transcriptText = result.text.trim();

        Speech.speak("Command received", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });

        await processVoiceCommand(transcriptText);
      } else {
        Speech.speak("Command not understood", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      }
    },
    [processVoiceCommand]
  );

  const { handleTouchStart, handleTouchEnd, cleanup } = useVoiceRecording({
    apiKey: "37c72e8e5dd344939db0183d6509ceec",
    language: "id",
    longPressThreshold: 1000,
    onTranscriptComplete: handleTranscriptComplete,
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleGameSelect = (gameId: string, moveAmount: number) => {
    router.push({
      pathname: "/game-detail/[gameId]",
      params: { gameId, moveAmount: moveAmount.toString() },
    });
  };
  const renderGameItem = ({ item }: { item: GameData }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-4 mb-3 p-4 shadow-sm border border-gray-100"
      onPress={() => handleGameSelect(item.GameID, item.MoveAmount)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
              <Ionicons
                name={getGameIcon(item.MoveAmount) as any}
                size={16}
                color="#374151"
              />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              {getGameDuration(item.MoveAmount)}
            </Text>
          </View>

          <Text className="text-sm text-gray-600 mb-1">
            {formatDate(item.Date)}
          </Text>

          <Text className="text-xs text-gray-400 font-mono">
            ID: {item.GameID.slice(0, 8)}...
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-2xl font-bold text-gray-900">
            {item.MoveAmount}
          </Text>
          <Text className="text-xs text-gray-400">moves</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-sm text-gray-700 font-medium mr-2">
              Analyze
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#374151" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="analytics" size={32} color="#374151" />
      </View>
      <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
        No Games Found
      </Text>
      <Text className="text-base text-gray-600 text-center leading-relaxed">
        Start playing chess to see your game analysis here. Your performance
        history will appear once you complete some games.
      </Text>
      <TouchableOpacity
        className="bg-gray-900 py-3 px-6 rounded-xl mt-6"
        onPress={onRefresh}
      >
        <Text className="text-white font-medium">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    if (games.length === 0) return null;

    return (
      <View className="px-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          Game Analysis
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          Review your chess performance and improve your game
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {stats.totalGames}
              </Text>
              <Text className="text-sm text-gray-600 font-medium">
                Total Games
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {stats.avgMoves}
              </Text>
              <Text className="text-sm text-gray-600 font-medium">
                Avg Moves
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {stats.longGames}
              </Text>
              <Text className="text-sm text-gray-600 font-medium">
                Long Games
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        className="flex-1 bg-gray-50"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <StatusBar style="dark" />

        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-1"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Analysis</Text>
          </View>
        </SafeAreaView>

        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#374151" />
          <Text className="text-gray-600 mt-4 text-base">
            Loading your games...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <StatusBar style="dark" />

      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-1"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 text-center">
              Analysis
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              {games.length} games played
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            className="p-1"
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={refreshing ? "#9CA3AF" : "#374151"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {games.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={games}
          renderItem={renderGameItem}
          keyExtractor={(item) => item.GameID}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#374151"]}
              tintColor="#374151"
            />
          }
        />
      )}
    </View>
  );
}
