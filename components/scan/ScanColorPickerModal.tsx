import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";

interface ScanColorPickerModalProps {
  visible: boolean;
  title: string;
  message: string;
  onSelectColor: (color: "white" | "black") => void;
  onCancel: () => void;
  voiceModeEnabled: boolean;
}

export const ScanColorPickerModal: React.FC<ScanColorPickerModalProps> = ({
  visible,
  title,
  message,
  onSelectColor,
  onCancel,
  voiceModeEnabled,
}) => {
  React.useEffect(() => {
    if (visible && voiceModeEnabled) {
      speak(`${title}. ${message}. Choose your color.`);
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
            onPress={() => voiceModeEnabled && speak("Chess Board Detected")}
            activeOpacity={0.8}
            style={{
              backgroundColor: WCAGColors.primary.yellowBg,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              alignSelf: "flex-start",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.primary.yellowDark,
                textTransform: "uppercase",
              }}
            >
              SUCCESS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => voiceModeEnabled && speak(title)}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.xxl,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.gray900,
                marginBottom: 4,
              }}
            >
              {title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => voiceModeEnabled && speak(message)}
            activeOpacity={0.8}
            style={{ marginBottom: 20 }}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.md,
                color: WCAGColors.neutral.gray600,
                marginBottom: 16,
              }}
            >
              {message}
            </Text>
          </TouchableOpacity>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                if (voiceModeEnabled) speak("Play as White");
                onSelectColor("white");
              }}
              style={{
                backgroundColor: WCAGColors.neutral.white,
                borderWidth: 2,
                borderColor: WCAGColors.neutral.gray300,
                paddingVertical: 18,
                borderRadius: AccessibilitySizes.radius.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minHeight: AccessibilitySizes.minTouchTarget,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Play as White"
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: WCAGColors.neutral.white,
                  borderWidth: 2,
                  borderColor: WCAGColors.neutral.gray400,
                  borderRadius: 14,
                  marginRight: 12,
                }}
              />
              <Text
                style={{
                  color: WCAGColors.neutral.gray900,
                  fontSize: AccessibilitySizes.text.lg,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                }}
              >
                Play as White
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (voiceModeEnabled) speak("Play as Black");
                onSelectColor("black");
              }}
              style={{
                backgroundColor: WCAGColors.primary.yellow,
                paddingVertical: 18,
                borderRadius: AccessibilitySizes.radius.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minHeight: AccessibilitySizes.minTouchTarget,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Play as Black"
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: WCAGColors.neutral.gray800,
                  borderWidth: 2,
                  borderColor: WCAGColors.neutral.gray600,
                  borderRadius: 14,
                  marginRight: 12,
                }}
              />
              <Text
                style={{
                  color: WCAGColors.neutral.gray900,
                  fontSize: AccessibilitySizes.text.lg,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                }}
              >
                Play as Black
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
