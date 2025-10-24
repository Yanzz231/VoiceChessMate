import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface LessonGameStatusProps {
  gameStatus: string;
  currentPlayer: string;
  isWaitingForBot: boolean;
  isProcessingMove: boolean;
  gameStatesLength: number;
  objective: string;
  isInCheck: boolean;
  voiceModeEnabled?: boolean;
  onTextPress?: (text: string) => void;
}

export const LessonGameStatus: React.FC<LessonGameStatusProps> = ({
  gameStatus,
  currentPlayer,
  isWaitingForBot,
  isProcessingMove,
  gameStatesLength,
  objective,
  isInCheck,
  voiceModeEnabled = false,
  onTextPress,
}) => {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        backgroundColor: WCAGColors.neutral.white,
        borderRadius: AccessibilitySizes.radius.lg,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Objective Badge */}
      <TouchableOpacity
        onPress={() => voiceModeEnabled && onTextPress && onTextPress(`Objective: ${objective}`)}
        style={{
          backgroundColor: WCAGColors.primary.yellowBg,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: AccessibilitySizes.radius.md,
          borderLeftWidth: 4,
          borderLeftColor: WCAGColors.primary.yellow,
          marginBottom: 12,
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Objective: ${objective}`}
        accessibilityHint="Tap to hear objective"
      >
        <Text
          style={{
            fontSize: AccessibilitySizes.text.xs,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.primary.yellowDark,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          Objective
        </Text>
        <Text
          style={{
            fontSize: AccessibilitySizes.text.sm,
            fontWeight: AccessibilitySizes.fontWeight.semibold,
            color: WCAGColors.neutral.gray900,
            lineHeight: 20,
          }}
        >
          {objective}
        </Text>
      </TouchableOpacity>

      {/* Stats Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => voiceModeEnabled && onTextPress && onTextPress(`Moves: ${gameStatesLength - 1}`)}
          style={{ flex: 1 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Moves: ${gameStatesLength - 1}`}
          accessibilityHint="Tap to hear move count"
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.xs,
              color: WCAGColors.neutral.gray600,
              marginBottom: 2,
            }}
          >
            Moves
          </Text>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.primary.yellow,
            }}
          >
            {gameStatesLength - 1}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            width: 1,
            height: 32,
            backgroundColor: WCAGColors.neutral.gray200,
          }}
        />

        <TouchableOpacity
          onPress={() => voiceModeEnabled && onTextPress && onTextPress(`Turn: ${Math.ceil(gameStatesLength / 2)}`)}
          style={{ flex: 1, alignItems: "center" }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Turn: ${Math.ceil(gameStatesLength / 2)}`}
          accessibilityHint="Tap to hear turn number"
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.xs,
              color: WCAGColors.neutral.gray600,
              marginBottom: 2,
            }}
          >
            Turn
          </Text>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.primary.yellow,
            }}
          >
            {Math.ceil(gameStatesLength / 2)}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            width: 1,
            height: 32,
            backgroundColor: WCAGColors.neutral.gray200,
          }}
        />

        <TouchableOpacity
          onPress={() => {
            if (voiceModeEnabled && onTextPress) {
              const statusText = isInCheck ? "CHECK!" : (gameStatus === "playing" ? "Playing" : "Game Over");
              onTextPress(`Status: ${statusText}`);
            }
          }}
          style={{ flex: 1, alignItems: "flex-end" }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Status: ${isInCheck ? "CHECK!" : (gameStatus === "playing" ? "Playing" : "Game Over")}`}
          accessibilityHint="Tap to hear game status"
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.xs,
              color: WCAGColors.neutral.gray600,
              marginBottom: 2,
            }}
          >
            Status
          </Text>
          {isInCheck ? (
            <Text
              style={{
                fontSize: AccessibilitySizes.text.sm,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.semantic.error,
              }}
            >
              CHECK!
            </Text>
          ) : (
            <Text
              style={{
                fontSize: AccessibilitySizes.text.sm,
                fontWeight: AccessibilitySizes.fontWeight.semibold,
                color: WCAGColors.semantic.success,
              }}
            >
              {gameStatus === "playing" ? "Playing" : "Game Over"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
