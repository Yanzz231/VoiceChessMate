import React from "react";
import { View, Text } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface LessonGameStatusProps {
  gameStatus: string;
  currentPlayer: string;
  isWaitingForBot: boolean;
  isProcessingMove: boolean;
  gameStatesLength: number;
  objective: string;
  isInCheck: boolean;
}

export const LessonGameStatus: React.FC<LessonGameStatusProps> = ({
  gameStatus,
  currentPlayer,
  isWaitingForBot,
  isProcessingMove,
  gameStatesLength,
  objective,
  isInCheck,
}) => {
  return (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: WCAGColors.neutral.white,
      borderBottomWidth: 1,
      borderBottomColor: WCAGColors.neutral.gray300,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{
          fontSize: AccessibilitySizes.text.md,
          fontWeight: AccessibilitySizes.fontWeight.semibold,
          color: WCAGColors.neutral.gray900,
        }}>
          {gameStatus === "playing"
            ? isWaitingForBot
              ? "Bot is thinking..."
              : isProcessingMove
              ? "Processing voice command..."
              : `${currentPlayer}'s turn`
            : "Game Over"}
        </Text>
        <Text style={{
          fontSize: AccessibilitySizes.text.sm,
          color: WCAGColors.neutral.gray600,
        }}>
          Moves: {gameStatesLength - 1} | Turn:{" "}
          {Math.ceil(gameStatesLength / 2)}
        </Text>
      </View>
      <Text style={{
        fontSize: AccessibilitySizes.text.md,
        fontWeight: AccessibilitySizes.fontWeight.semibold,
        color: WCAGColors.neutral.gray900,
        marginTop: 8,
      }}>
        Objective: {objective}
      </Text>
      {isInCheck && gameStatus === "playing" && (
        <Text style={{
          color: WCAGColors.semantic.error,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          marginTop: 4,
        }}>Check!</Text>
      )}
    </View>
  );
};
