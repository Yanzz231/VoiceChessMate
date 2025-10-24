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
      borderRadius: AccessibilitySizes.radius.lg,
      padding: 16,
      minHeight: 150,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      }}>
        <View style={{
          width: 4,
          height: 20,
          backgroundColor: WCAGColors.primary.yellow,
          borderRadius: 2,
          marginRight: 8,
        }} />
        <Text style={{
          fontSize: AccessibilitySizes.text.md,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          color: WCAGColors.neutral.gray900,
        }}>
          Move History
        </Text>
      </View>

      <View style={{
        flexDirection: "row",
        backgroundColor: WCAGColors.primary.yellowBg,
        borderRadius: AccessibilitySizes.radius.md,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
      }}>
        <Text style={{
          flex: 0.25,
          fontSize: AccessibilitySizes.text.xs,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          color: WCAGColors.primary.yellowDark,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          #
        </Text>
        <Text style={{
          flex: 1,
          fontSize: AccessibilitySizes.text.xs,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          color: WCAGColors.primary.yellowDark,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          White
        </Text>
        <Text style={{
          flex: 1,
          fontSize: AccessibilitySizes.text.xs,
          fontWeight: AccessibilitySizes.fontWeight.bold,
          color: WCAGColors.primary.yellowDark,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          Black
        </Text>
      </View>

      <ScrollView style={{ maxHeight: 130 }} showsVerticalScrollIndicator={false}>
        {moves.map((move, index) => (
          <View
            key={move.moveNumber}
            style={{
              flexDirection: "row",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: AccessibilitySizes.radius.sm,
              backgroundColor: index % 2 === 0 ? WCAGColors.neutral.gray50 : "transparent",
              marginBottom: 2,
            }}
          >
            <View style={{
              flex: 0.25,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: WCAGColors.primary.yellow,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{
                  fontSize: AccessibilitySizes.text.xs,
                  color: WCAGColors.neutral.white,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                }}>
                  {move.moveNumber}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleMovePress(move.moveNumber, "white", move.white)}
              style={{
                flex: 1,
                justifyContent: "center",
                paddingHorizontal: 8,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Move ${move.moveNumber}, White: ${move.white}`}
              accessibilityHint="Tap to hear move details"
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.sm,
                color: WCAGColors.neutral.gray900,
                fontWeight: AccessibilitySizes.fontWeight.semibold,
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
              style={{
                flex: 1,
                justifyContent: "center",
                paddingHorizontal: 8,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={move.black ? `Move ${move.moveNumber}, Black: ${move.black}` : "Empty square"}
              accessibilityHint="Tap to hear move details"
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.sm,
                color: move.black ? WCAGColors.neutral.gray900 : WCAGColors.neutral.gray400,
                fontWeight: move.black ? AccessibilitySizes.fontWeight.semibold : AccessibilitySizes.fontWeight.medium,
                fontStyle: move.black ? "normal" : "italic",
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
