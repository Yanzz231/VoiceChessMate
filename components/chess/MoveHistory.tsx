import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";

interface Move {
  moveNumber: number;
  white: string;
  black?: string;
}

interface MoveHistoryProps {
  moves: Move[];
  voiceModeEnabled: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, voiceModeEnabled }) => {
  const handleMovePress = (moveNumber: number, color: "white" | "black", move: string) => {
    if (voiceModeEnabled) {
      speak(`Move ${moveNumber}. ${color}: ${move}`);
    }
  };

  return (
    <View style={{
      backgroundColor: WCAGColors.neutral.white,
      borderRadius: AccessibilitySizes.radius.md,
      padding: 12,
      maxHeight: 200,
    }}>
      <Text style={{
        fontSize: AccessibilitySizes.text.md,
        fontWeight: AccessibilitySizes.fontWeight.bold,
        color: WCAGColors.neutral.gray900,
        marginBottom: 8,
      }}>
        Move History
      </Text>

      <View style={{
        flexDirection: "row",
        borderBottomWidth: 2,
        borderBottomColor: WCAGColors.primary.yellow,
        paddingBottom: 8,
        marginBottom: 4,
      }}>
        <Text style={{
          flex: 0.3,
          fontSize: AccessibilitySizes.text.sm,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          color: WCAGColors.neutral.gray700,
          textAlign: "center",
        }}>
          #
        </Text>
        <Text style={{
          flex: 1,
          fontSize: AccessibilitySizes.text.sm,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          color: WCAGColors.neutral.gray700,
        }}>
          White
        </Text>
        <Text style={{
          flex: 1,
          fontSize: AccessibilitySizes.text.sm,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          color: WCAGColors.neutral.gray700,
        }}>
          Black
        </Text>
      </View>

      <ScrollView style={{ maxHeight: 140 }} showsVerticalScrollIndicator={false}>
        {moves.map((move) => (
          <View
            key={move.moveNumber}
            style={{
              flexDirection: "row",
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: WCAGColors.neutral.gray200,
            }}
          >
            <Text style={{
              flex: 0.3,
              fontSize: AccessibilitySizes.text.sm,
              color: WCAGColors.neutral.gray600,
              textAlign: "center",
              fontWeight: AccessibilitySizes.fontWeight.semibold,
            }}>
              {move.moveNumber}
            </Text>
            <TouchableOpacity
              onPress={() => handleMovePress(move.moveNumber, "white", move.white)}
              style={{ flex: 1 }}
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.sm,
                color: WCAGColors.neutral.gray900,
                fontWeight: AccessibilitySizes.fontWeight.medium,
              }}>
                {move.white}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (voiceModeEnabled) {
                  if (move.black) {
                    handleMovePress(move.moveNumber, "black", move.black);
                  } else {
                    speak("Empty");
                  }
                }
              }}
              style={{ flex: 1 }}
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.sm,
                color: move.black ? WCAGColors.neutral.gray900 : WCAGColors.neutral.gray400,
                fontWeight: AccessibilitySizes.fontWeight.medium,
              }}>
                {move.black || "-"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
