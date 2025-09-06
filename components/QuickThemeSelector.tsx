import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import {
  BackHandler,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CHESS_THEMES, ChessTheme } from "@/constants/chessThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";

interface QuickThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: ChessTheme;
  onThemeChange: (theme: ChessTheme) => void;
}

const QuickThemeSelector: React.FC<QuickThemeSelectorProps> = ({
  visible,
  onClose,
  currentTheme,
  onThemeChange,
}) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [visible, onClose]);
  const handleThemeSelect = async (theme: ChessTheme) => {
    try {
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.THEME, theme.id);
      onThemeChange(theme);
      onClose();
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const renderThemeOption = (theme: ChessTheme) => {
    const isSelected = currentTheme.id === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        onPress={() => handleThemeSelect(theme)}
        className={`flex-row items-center p-4 mb-3 rounded-2xl border-2 ${
          isSelected
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <View className="mr-4">
          <View className="flex-row">
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
                        width: 12,
                        height: 12,
                        backgroundColor,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              isSelected ? "text-indigo-700" : "text-gray-800"
            }`}
          >
            {theme.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View
              className="w-3 h-3 rounded border border-gray-300"
              style={{ backgroundColor: theme.lightSquare }}
            />
            <View
              className="w-3 h-3 rounded border border-gray-300"
              style={{ backgroundColor: theme.darkSquare }}
            />
          </View>
        </View>

        {isSelected && (
          <View className="w-6 h-6 bg-indigo-500 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-xs">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white h-full">
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-800">
                Choose Board Theme
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-600 font-bold">×</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              Select a theme for your chess board
            </Text>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {CHESS_THEMES.map((theme) => renderThemeOption(theme))}
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default QuickThemeSelector;
