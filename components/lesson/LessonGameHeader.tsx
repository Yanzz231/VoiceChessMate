import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  voiceModeEnabled?: boolean;
  onTextPress?: (text: string) => void;
}

export const LessonGameHeader: React.FC<LessonGameHeaderProps> = ({
  title,
  currentPlayer,
  currentThemeName,
  isWaitingForBot,
  isProcessingMove,
  onBackPress,
  onSettingsPress,
  voiceModeEnabled = false,
  onTextPress,
}) => {
  return (
    <LinearGradient
      colors={[WCAGColors.primary.yellow, WCAGColors.primary.yellowDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 56,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <TouchableOpacity
          onPress={onBackPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to lesson map"
        >
          <BackIcon height={24} width={24} color={WCAGColors.neutral.white} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => voiceModeEnabled && onTextPress && onTextPress(title)}
          style={{ flex: 1, alignItems: "center", marginHorizontal: 12 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityHint="Tap to hear lesson title"
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.white,
              textAlign: "center",
              textShadowColor: "rgba(0, 0, 0, 0.1)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSettingsPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          accessibilityHint="Open game settings"
        >
          <Setting height={24} width={24} color={WCAGColors.neutral.white} />
        </TouchableOpacity>
      </View>

      {/* Status Badge */}
      <TouchableOpacity
        onPress={() => {
          if (voiceModeEnabled && onTextPress) {
            const statusText = isWaitingForBot
              ? "Bot thinking..."
              : isProcessingMove
              ? "Processing..."
              : `${currentPlayer}'s turn`;
            onTextPress(statusText);
          }
        }}
        style={{
          alignSelf: "center",
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isWaitingForBot ? "Bot thinking..." : isProcessingMove ? "Processing..." : `${currentPlayer}'s turn`}
        accessibilityHint="Tap to hear current player turn"
      >
        {(isWaitingForBot || isProcessingMove) && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: WCAGColors.neutral.white,
            }}
          />
        )}
        <Text
          style={{
            fontSize: AccessibilitySizes.text.sm,
            fontWeight: AccessibilitySizes.fontWeight.semibold,
            color: WCAGColors.neutral.white,
          }}
        >
          {isWaitingForBot
            ? "Bot thinking..."
            : isProcessingMove
            ? "Processing..."
            : `${currentPlayer}'s turn`}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};
