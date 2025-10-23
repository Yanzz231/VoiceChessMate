import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { PieceRenderer } from "@/components/chess/PieceRenderer";

interface PendingPromotion {
  from: string;
  to: string;
  color: "w" | "b";
}

type PromotionPiece = "q" | "r" | "b" | "n";

interface LessonPromotionModalProps {
  visible: boolean;
  pendingPromotion: PendingPromotion | null;
  currentPieceTheme: { version: string };
  voiceModeEnabled: boolean;
  onPromote: (piece: PromotionPiece) => void;
  onTextPress: (text: string) => void;
}

export const LessonPromotionModal: React.FC<LessonPromotionModalProps> = ({
  visible,
  pendingPromotion,
  currentPieceTheme,
  voiceModeEnabled,
  onPromote,
  onTextPress,
}) => {
  useEffect(() => {
    if (visible && voiceModeEnabled) {
      onTextPress("Pawn Promotion. Choose what piece your pawn becomes.");
    }
  }, [visible]);

  if (!pendingPromotion) return null;

  const promotionPieces = [
    { type: "q", name: "Queen" },
    { type: "r", name: "Rook" },
    { type: "b", name: "Bishop" },
    { type: "n", name: "Knight" },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center" }}>
        <View style={{
          backgroundColor: WCAGColors.neutral.white,
          borderRadius: AccessibilitySizes.radius.xl,
          marginHorizontal: AccessibilitySizes.spacing.lg,
          maxWidth: 400,
          width: "90%",
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}>
          <View style={{
            backgroundColor: WCAGColors.primary.yellow,
            padding: 20,
            alignItems: "center",
          }}>
            <Text style={{
              fontSize: AccessibilitySizes.text.xl,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.white,
            }}>
              Pawn Promotion
            </Text>
          </View>

          <View style={{ padding: 24 }}>
            <TouchableOpacity
              onPress={() => voiceModeEnabled && onTextPress("Choose what piece your pawn becomes")}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="Choose what piece your pawn becomes"
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.md,
                color: WCAGColors.neutral.gray600,
                textAlign: "center",
                marginBottom: 20,
              }}>
                Choose what piece your pawn becomes:
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-around", alignItems: "center", marginVertical: 16 }}>
              {promotionPieces.map((piece) => (
                <TouchableOpacity
                  key={piece.type}
                  onPress={() => {
                    if (voiceModeEnabled) {
                      onTextPress(piece.name);
                    }
                    onPromote(piece.type as PromotionPiece);
                  }}
                  style={{
                    alignItems: "center",
                    padding: 12,
                    borderRadius: AccessibilitySizes.radius.lg,
                    backgroundColor: WCAGColors.primary.yellowBg,
                    borderWidth: 2,
                    borderColor: WCAGColors.primary.yellow,
                    width: 75,
                    minHeight: 90,
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Promote to ${piece.name}`}
                  accessibilityHint={`Tap to promote pawn to ${piece.name}`}
                >
                  <View style={{ width: 48, height: 48, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
                    <PieceRenderer
                      type={piece.type as any}
                      color={pendingPromotion.color}
                      theme={currentPieceTheme.version}
                      size={48}
                    />
                  </View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: AccessibilitySizes.fontWeight.semibold,
                    color: WCAGColors.neutral.gray900,
                    textAlign: "center",
                  }}>
                    {piece.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => voiceModeEnabled && onTextPress("Tap on a piece to promote your pawn")}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="Tap on a piece to promote your pawn"
            >
              <Text style={{
                fontSize: 11,
                color: WCAGColors.neutral.gray600,
                textAlign: "center",
                marginTop: 8,
              }}>
                Tap on a piece to promote your pawn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
