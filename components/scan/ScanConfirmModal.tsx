import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";

interface ScanConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  voiceModeEnabled: boolean;
}

export const ScanConfirmModal: React.FC<ScanConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  voiceModeEnabled,
}) => {
  const isError = title === "Error" || title === "Analysis Failed";

  React.useEffect(() => {
    if (visible && voiceModeEnabled) {
      speak(`${title}. ${message}`);
    }
  }, [visible, voiceModeEnabled, title, message]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: WCAGColors.neutral.white,
            borderTopLeftRadius: AccessibilitySizes.radius.xl,
            borderTopRightRadius: AccessibilitySizes.radius.xl,
            padding: AccessibilitySizes.spacing.xl,
            paddingBottom: 40,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => voiceModeEnabled && speak(title)}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel={title}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.xl,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.gray900,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => voiceModeEnabled && speak(message)}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={message}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.md,
                color: WCAGColors.neutral.gray600,
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 24,
              }}
            >
              {message}
            </Text>
          </TouchableOpacity>

          <View style={{ gap: 12 }}>
            {onConfirm && (
              <TouchableOpacity
                onPress={() => {
                  if (voiceModeEnabled) speak(confirmText);
                  onConfirm();
                }}
                style={{
                  backgroundColor: isError
                    ? WCAGColors.semantic.error
                    : WCAGColors.primary.yellow,
                  paddingVertical: 16,
                  borderRadius: AccessibilitySizes.radius.lg,
                  shadowColor: isError ? WCAGColors.semantic.error : WCAGColors.primary.yellow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={confirmText}
              >
                <Text
                  style={{
                    color: WCAGColors.neutral.white,
                    fontSize: AccessibilitySizes.text.lg,
                    fontWeight: AccessibilitySizes.fontWeight.semibold,
                    textAlign: "center",
                  }}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            )}

            {onCancel && cancelText && (
              <TouchableOpacity
                onPress={() => {
                  if (voiceModeEnabled) speak(cancelText);
                  onCancel();
                }}
                style={{
                  backgroundColor: WCAGColors.neutral.gray100,
                  paddingVertical: 16,
                  borderRadius: AccessibilitySizes.radius.lg,
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={cancelText}
              >
                <Text
                  style={{
                    color: WCAGColors.neutral.gray700,
                    fontSize: AccessibilitySizes.text.lg,
                    fontWeight: AccessibilitySizes.fontWeight.medium,
                    textAlign: "center",
                  }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
