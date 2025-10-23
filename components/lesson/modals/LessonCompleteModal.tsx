import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface LessonCompleteModalProps {
  visible: boolean;
  title: string;
  voiceModeEnabled: boolean;
  onClose: () => void;
  onTextPress: (text: string) => void;
}

export const LessonCompleteModal: React.FC<LessonCompleteModalProps> = ({
  visible,
  title,
  voiceModeEnabled,
  onClose,
  onTextPress,
}) => {
  useEffect(() => {
    if (visible && voiceModeEnabled) {
      onTextPress(`Course Complete! You have successfully completed ${title}`);
    }
  }, [visible]);

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
          padding: AccessibilitySizes.spacing.xl,
          maxWidth: 400,
          width: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}>
          <View style={{
            backgroundColor: WCAGColors.primary.yellow,
            padding: 20,
            marginHorizontal: -24,
            marginTop: -24,
            marginBottom: 20,
            borderTopLeftRadius: AccessibilitySizes.radius.xl,
            borderTopRightRadius: AccessibilitySizes.radius.xl,
            alignItems: "center"
          }}>
            <Text style={{
              fontSize: AccessibilitySizes.text.xxl,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.white,
              textAlign: "center",
            }}>
              Course Complete
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => voiceModeEnabled && onTextPress(`You have successfully completed ${title}`)}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`You have successfully completed ${title}`}
          >
            <Text style={{
              fontSize: AccessibilitySizes.text.lg,
              color: WCAGColors.neutral.gray700,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 24,
            }}>
              You have successfully completed "{title}"
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (voiceModeEnabled) onTextPress("Continue Learning");
              onClose();
            }}
            style={{
              backgroundColor: WCAGColors.primary.yellow,
              paddingVertical: 16,
              borderRadius: AccessibilitySizes.radius.md,
              minHeight: AccessibilitySizes.minTouchTarget,
              justifyContent: "center",
              shadowColor: WCAGColors.primary.yellow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Continue Learning"
            accessibilityHint="Return to lesson map"
          >
            <Text style={{
              color: WCAGColors.neutral.white,
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              textAlign: "center",
            }}>
              Continue Learning
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
