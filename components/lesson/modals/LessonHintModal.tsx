import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface LessonHintModalProps {
  visible: boolean;
  hintMessage: string;
  voiceModeEnabled: boolean;
  onClose: () => void;
  onTextPress: (text: string) => void;
}

export const LessonHintModal: React.FC<LessonHintModalProps> = ({
  visible,
  hintMessage,
  voiceModeEnabled,
  onClose,
  onTextPress,
}) => {
  useEffect(() => {
    if (visible && voiceModeEnabled) {
      onTextPress(`Chess Hint. ${hintMessage}`);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center" }}>
        <View style={{
          backgroundColor: WCAGColors.neutral.white,
          borderRadius: AccessibilitySizes.radius.xl,
          marginHorizontal: AccessibilitySizes.spacing.lg,
          padding: AccessibilitySizes.spacing.xl,
          maxWidth: 400,
          width: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}>
          <Text style={{
            fontSize: AccessibilitySizes.text.xl,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.neutral.gray900,
            textAlign: "center",
            marginBottom: 8,
          }}>
            Chess Hint
          </Text>
          <TouchableOpacity
            onPress={() => voiceModeEnabled && onTextPress(hintMessage)}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={hintMessage}
            accessibilityHint="Tap to hear hint message"
          >
            <Text style={{
              fontSize: AccessibilitySizes.text.md,
              color: WCAGColors.neutral.gray700,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 20,
            }}>
              {hintMessage}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (voiceModeEnabled) onTextPress("Got it");
              onClose();
            }}
            style={{
              backgroundColor: WCAGColors.primary.yellow,
              paddingVertical: 14,
              borderRadius: AccessibilitySizes.radius.md,
              minHeight: AccessibilitySizes.minTouchTarget,
              justifyContent: "center",
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Got it"
            accessibilityHint="Close hint modal"
          >
            <Text style={{
              color: WCAGColors.neutral.white,
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              textAlign: "center",
            }}>
              Got it!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
