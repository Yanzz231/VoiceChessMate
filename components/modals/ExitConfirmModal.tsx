import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, AccessibilityInfo } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LinearGradient } from "expo-linear-gradient";
import { speak } from "@/utils/speechUtils";

interface ExitConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title,
  message,
}) => {
  useEffect(() => {
    if (visible) {
      const announcement = `Confirmation. ${title}. ${message}`;
      AccessibilityInfo.announceForAccessibility(announcement);
      speak(announcement);
    }
  }, [visible, title, message]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal={true}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: AccessibilitySizes.spacing.xl,
        }}
        accessible={true}
        accessibilityLabel="Close dialog by tapping outside"
        accessibilityRole="button"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: WCAGColors.neutral.white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 400,
            padding: AccessibilitySizes.spacing.xl,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
          accessible={false}
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.xl,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.gray900,
              textAlign: 'center',
              marginBottom: AccessibilitySizes.spacing.md,
            }}
            accessible={true}
            accessibilityLabel={`Title: ${title}`}
            accessibilityRole="header"
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: AccessibilitySizes.text.base,
              fontWeight: AccessibilitySizes.fontWeight.normal,
              color: WCAGColors.neutral.gray600,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: AccessibilitySizes.spacing.xl,
            }}
            accessible={true}
            accessibilityLabel={`Message: ${message}`}
            accessibilityRole="text"
          >
            {message}
          </Text>

          <View style={{ gap: AccessibilitySizes.spacing.md }}>
            <TouchableOpacity
              onPress={() => {
                speak('Exit');
                onConfirm();
              }}
              style={{
                minHeight: AccessibilitySizes.minTouchTargetLarge,
                borderRadius: 14,
                overflow: 'hidden',
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Exit"
              accessibilityHint="Tap to exit the application"
            >
              <LinearGradient
                colors={['#E74C3C', '#C0392B']}
                style={{
                  minHeight: AccessibilitySizes.minTouchTargetLarge,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: AccessibilitySizes.text.md,
                    fontWeight: AccessibilitySizes.fontWeight.bold,
                    color: WCAGColors.neutral.white,
                  }}
                  importantForAccessibility="no"
                >
                  Exit
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                speak('Cancel');
                onCancel();
              }}
              style={{
                minHeight: AccessibilitySizes.minTouchTargetLarge,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: WCAGColors.neutral.gray100,
                borderWidth: 2,
                borderColor: WCAGColors.neutral.gray300,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityHint="Tap to cancel and go back"
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.gray800,
                }}
                importantForAccessibility="no"
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
