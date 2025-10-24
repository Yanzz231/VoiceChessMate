import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FlagIcon } from "@/components/icons/FlagIcon";
import { HintIcon } from "@/components/icons/HintIcon";
import { Mic } from "@/components/icons/Mic";
import { UndoIcon } from "@/components/icons/UndoIcon";
import { HistoryIcon } from "@/components/icons/HistoryIcon";
import { BoardIcon } from "@/components/icons/BoardIcon";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface LessonGameControlsProps {
  isVoiceDisabled: boolean;
  currentPlayerTurn: boolean;
  isProcessingMove: boolean;
  canUndo: boolean;
  onQuitPress: () => void;
  onVoicePressIn: () => void;
  onVoicePressOut: () => void;
  onHintPress: () => void;
  onUndoPress: () => void;
  onHistoryPress: () => void;
  showHistoryView: boolean;
}

export const LessonGameControls: React.FC<LessonGameControlsProps> = ({
  isVoiceDisabled,
  currentPlayerTurn,
  isProcessingMove,
  canUndo,
  onQuitPress,
  onVoicePressIn,
  onVoicePressOut,
  onHintPress,
  onUndoPress,
  onHistoryPress,
  showHistoryView,
}) => {
  return (
    <View
      style={{
        backgroundColor: WCAGColors.neutral.white,
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: WCAGColors.neutral.gray200,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
        {/* Quit Button */}
        <TouchableOpacity
          onPress={onQuitPress}
          style={{
            alignItems: "center",
            opacity: isVoiceDisabled ? 0.4 : 1,
          }}
          disabled={isVoiceDisabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quit lesson"
          accessibilityHint="Exit current lesson"
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: WCAGColors.neutral.gray100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FlagIcon width={22} height={22} color={WCAGColors.neutral.gray700} />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: isVoiceDisabled ? WCAGColors.neutral.gray400 : WCAGColors.neutral.gray700,
              marginTop: 4,
            }}
          >
            Quit
          </Text>
        </TouchableOpacity>

        {/* History/Board Toggle Button */}
        <TouchableOpacity
          onPress={onHistoryPress}
          style={{
            alignItems: "center",
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={showHistoryView ? "Show board" : "Show move history"}
          accessibilityHint="Toggle between board and move history view"
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: showHistoryView ? WCAGColors.primary.yellow : WCAGColors.neutral.gray100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {showHistoryView ? (
              <BoardIcon
                width={22}
                height={22}
                color={WCAGColors.neutral.white}
              />
            ) : (
              <HistoryIcon
                width={22}
                height={22}
                color={WCAGColors.neutral.gray700}
              />
            )}
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: showHistoryView ? WCAGColors.primary.yellow : WCAGColors.neutral.gray700,
              marginTop: 4,
            }}
          >
            {showHistoryView ? "Board" : "History"}
          </Text>
        </TouchableOpacity>

        {/* Voice Button - HERO */}
        <TouchableOpacity
          disabled={!currentPlayerTurn || isVoiceDisabled}
          onPressIn={
            currentPlayerTurn && !isVoiceDisabled
              ? onVoicePressIn
              : undefined
          }
          onPressOut={
            currentPlayerTurn && !isVoiceDisabled
              ? onVoicePressOut
              : undefined
          }
          style={{
            alignItems: "center",
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isProcessingMove ? "Processing voice command" : "Voice input"}
          accessibilityHint="Hold to speak your chess move"
          accessibilityState={{ disabled: !currentPlayerTurn || isVoiceDisabled }}
        >
          <LinearGradient
            colors={
              !currentPlayerTurn || isVoiceDisabled
                ? [WCAGColors.neutral.gray300, WCAGColors.neutral.gray400]
                : isProcessingMove
                ? [WCAGColors.primary.yellowLight, WCAGColors.primary.yellow]
                : [WCAGColors.primary.yellow, WCAGColors.primary.yellowDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: WCAGColors.primary.yellow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: (!currentPlayerTurn || isVoiceDisabled) ? 0 : 0.3,
              shadowRadius: 8,
              elevation: (!currentPlayerTurn || isVoiceDisabled) ? 2 : 8,
            }}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                borderWidth: 2.5,
                borderColor: "rgba(255, 255, 255, 0.3)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Mic height={28} width={28} color={WCAGColors.neutral.white} />
            </View>
          </LinearGradient>
          <Text
            style={{
              fontSize: 11,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: (!currentPlayerTurn || isVoiceDisabled) ? WCAGColors.neutral.gray400 : WCAGColors.primary.yellow,
              marginTop: 4,
            }}
          >
            {isProcessingMove ? "Processing..." : "Voice"}
          </Text>
        </TouchableOpacity>

        {/* Hint Button */}
        <TouchableOpacity
          onPress={onHintPress}
          style={{
            alignItems: "center",
            opacity: isVoiceDisabled ? 0.4 : 1,
          }}
          disabled={isVoiceDisabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Get hint"
          accessibilityHint="Show suggested move"
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: WCAGColors.neutral.gray100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <HintIcon width={22} height={22} color={WCAGColors.neutral.gray700} />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: isVoiceDisabled ? WCAGColors.neutral.gray400 : WCAGColors.neutral.gray700,
              marginTop: 4,
            }}
          >
            Hint
          </Text>
        </TouchableOpacity>

        {/* Undo Button */}
        <TouchableOpacity
          onPress={onUndoPress}
          disabled={!canUndo}
          style={{
            alignItems: "center",
            opacity: !canUndo ? 0.4 : 1,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Undo move"
          accessibilityHint="Take back last move"
          accessibilityState={{ disabled: !canUndo }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: WCAGColors.neutral.gray100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <UndoIcon width={22} height={22} color={WCAGColors.neutral.gray700} />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: !canUndo ? WCAGColors.neutral.gray400 : WCAGColors.neutral.gray700,
              marginTop: 4,
            }}
          >
            Undo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
