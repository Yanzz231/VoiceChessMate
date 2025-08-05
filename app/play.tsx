import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function PlayWithAI() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("Intermediate");
  const [selectedColor, setSelectedColor] = useState<"white" | "black">(
    "white"
  ); // State untuk warna
  const [gameStarted, setGameStarted] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const handleStart = () => {
    setGameStarted(true);
    console.log(
      `Starting game with difficulty: ${selectedLevel}, playing as: ${selectedColor}`
    );
    setTimeout(() => {
      setGameStarted(false);
    }, 2000);
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setDropdownVisible(false);
  };

  const handleColorSelect = (color: "white" | "black") => {
    setSelectedColor(color);
  };

  if (gameStarted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-indigo-500 rounded-full justify-center items-center mb-6">
            <Text className="text-white text-3xl">🤖</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Game Starting...
          </Text>
          <Text className="text-gray-600 text-center text-base leading-relaxed">
            Preparing your {selectedLevel.toLowerCase()} level chess game with
            AI opponent. You are playing as{" "}
            {selectedColor === "white" ? "White" : "Black"} pieces.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-4 pt-14">
        {/* NAVBAR */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
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
        >
          <Text className="text-white text-lg font-semibold text-center">
            Start Game
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
