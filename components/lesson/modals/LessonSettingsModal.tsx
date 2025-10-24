import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface LessonSettingsModalProps {
  visible: boolean;
  voiceModeEnabled: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onTextPress: (text: string) => void;
}

export const LessonSettingsModal: React.FC<LessonSettingsModalProps> = ({
  visible,
  voiceModeEnabled,
  onClose,
  onOpenSettings,
  onTextPress,
}) => {
  useEffect(() => {
    if (visible && voiceModeEnabled) {
      onTextPress("Open Settings? Opening settings might affect your current game progress. Are you sure you want to continue?");
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={{ flex: 1, backgroundColor: "transparent", justifyContent: "center", alignItems: "center" }}>
        <View style={{
          backgroundColor: WCAGColors.neutral.white,
          borderRadius: AccessibilitySizes.radius.lg,
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
              Open Settings?
            </Text>
          </View>

          <View style={{ padding: 24 }}>
            <TouchableOpacity
              onPress={() => voiceModeEnabled && onTextPress("Opening settings might affect your current game progress. Are you sure you want to continue?")}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="Opening settings might affect your current game progress. Are you sure you want to continue?"
            >
              <Text style={{
                fontSize: AccessibilitySizes.text.md,
                color: WCAGColors.neutral.gray600,
                marginBottom: 24,
                lineHeight: 22,
                textAlign: "center",
              }}>
                Opening settings might affect your current game progress. Are you sure you want to continue?
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => {
                  if (voiceModeEnabled) onTextPress("Cancel");
                  onClose();
                }}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: AccessibilitySizes.radius.md,
                  minHeight: AccessibilitySizes.minTouchTarget,
                  justifyContent: "center",
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Stay in game"
              >
                <Text style={{
                  color: WCAGColors.primary.yellow,
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (voiceModeEnabled) onTextPress("Open Settings");
                  onOpenSettings();
                }}
                style={{
                  backgroundColor: WCAGColors.primary.yellow,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: AccessibilitySizes.radius.md,
                  minHeight: AccessibilitySizes.minTouchTarget,
                  justifyContent: "center",
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Open Settings"
                accessibilityHint="Navigate to settings page"
              >
                <Text style={{
                  color: WCAGColors.neutral.white,
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                }}>
                  Open Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
