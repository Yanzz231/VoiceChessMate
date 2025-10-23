import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BackIcon } from "@/components/BackIcon";
import { Setting } from "@/components/icons/Setting";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface LessonGameHeaderProps {
  title: string;
  currentPlayer: string;
  currentThemeName: string;
  isWaitingForBot: boolean;
  isProcessingMove: boolean;
  onBackPress: () => void;
  onSettingsPress: () => void;
}

export const LessonGameHeader: React.FC<LessonGameHeaderProps> = ({
  title,
  currentPlayer,
  currentThemeName,
  isWaitingForBot,
  isProcessingMove,
  onBackPress,
  onSettingsPress,
}) => {
  return (
    <View style={{
      backgroundColor: WCAGColors.neutral.white,
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingTop: 56,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={onBackPress}
          style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}
        >
          <BackIcon height={30} width={30} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{
            fontSize: AccessibilitySizes.text.lg,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.neutral.gray900,
          }}>{title}</Text>
          <Text style={{
            fontSize: AccessibilitySizes.text.sm,
            color: WCAGColors.neutral.gray600,
          }}>
            {isWaitingForBot
              ? "Bot thinking..."
              : isProcessingMove
              ? "Processing voice..."
              : `${currentPlayer} to move`}{" "}
            • {currentThemeName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSettingsPress}
          style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}
        >
          <Setting height={30} width={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
