import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FlagIcon } from "@/components/icons/FlagIcon";
import { HintIcon } from "@/components/icons/HintIcon";
import { Mic } from "@/components/icons/Mic";
import { UndoIcon } from "@/components/icons/UndoIcon";
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
}) => {
  return (
    <View style={{
      backgroundColor: WCAGColors.neutral.white,
      paddingHorizontal: 16,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderTopColor: WCAGColors.neutral.gray300,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={onQuitPress}
          style={{ alignItems: "center", flex: 1 }}
          disabled={isVoiceDisabled}
        >
          <View
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              opacity: isVoiceDisabled ? 0.3 : 1,
            }}
          >
            <FlagIcon width={30} height={30} />
          </View>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.sm,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: isVoiceDisabled ? WCAGColors.neutral.gray300 : WCAGColors.neutral.gray900,
            }}
          >
            Quit
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", flex: 1 }}>
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
            style={{ alignItems: "center" }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor:
                  !currentPlayerTurn || isVoiceDisabled
                    ? WCAGColors.neutral.gray400
                    : WCAGColors.primary.yellow,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Mic height={24} width={24} color="white" />
            </View>
            <Text
              style={{
                fontSize: AccessibilitySizes.text.sm,
                fontWeight: AccessibilitySizes.fontWeight.semibold,
                color:
                  !currentPlayerTurn || isVoiceDisabled
                    ? WCAGColors.neutral.gray300
                    : WCAGColors.neutral.gray900,
              }}
            >
              {isProcessingMove ? "Processing..." : "Voice"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onHintPress}
          style={{ alignItems: "center", flex: 1 }}
          disabled={isVoiceDisabled}
        >
          <View
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              opacity: isVoiceDisabled ? 0.3 : 1,
            }}
          >
            <HintIcon width={30} height={30} />
          </View>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.sm,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: isVoiceDisabled ? WCAGColors.neutral.gray300 : WCAGColors.neutral.gray900,
            }}
          >
            Hint
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onUndoPress}
          disabled={!canUndo}
          style={{ alignItems: "center", flex: 1 }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              opacity: !canUndo ? 0.3 : 1,
            }}
          >
            <UndoIcon width={30} height={30} />
          </View>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.sm,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: !canUndo ? WCAGColors.neutral.gray300 : WCAGColors.neutral.gray900,
            }}
          >
            Undo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
