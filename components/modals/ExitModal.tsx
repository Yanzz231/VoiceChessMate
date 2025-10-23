import React, { useEffect } from "react";
import { Modal, TouchableOpacity, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";

interface ExitModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (visible) {
      const checkVoiceMode = async () => {
        const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
        if (voiceMode === "true") {
          speak("Are you sure you want to change this page? Changes you made will not be saved.");
        }
      };
      checkVoiceMode();
    }
  }, [visible]);

  const handleTextPress = async (text: string) => {
    const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
    if (voiceMode === "true") {
      speak(text);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.75)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
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
          }}
        >
          <View
            style={{
              backgroundColor: WCAGColors.primary.yellow,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                <Path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill={WCAGColors.neutral.white}
                />
                <Path
                  d="M2 17L12 22L22 17"
                  stroke={WCAGColors.neutral.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M2 12L12 17L22 12"
                  stroke={WCAGColors.neutral.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.white,
                }}
              >
                Are you sure you want to change this page?
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke={WCAGColors.neutral.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 24 }}>
            <TouchableOpacity onPress={() => handleTextPress("Changes you made will not be saved")}>
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  color: WCAGColors.neutral.gray600,
                  marginBottom: 24,
                  lineHeight: 22,
                }}
              >
                Changes you made will not be saved
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => {
                  handleTextPress("No");
                  onCancel();
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
                accessibilityLabel="NO"
              >
                <Text
                  style={{
                    color: WCAGColors.primary.yellow,
                    fontSize: AccessibilitySizes.text.md,
                    fontWeight: AccessibilitySizes.fontWeight.bold,
                  }}
                >
                  NO
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleTextPress("Yes");
                  onConfirm();
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
                accessibilityLabel="YES"
              >
                <Text
                  style={{
                    color: WCAGColors.neutral.white,
                    fontSize: AccessibilitySizes.text.md,
                    fontWeight: AccessibilitySizes.fontWeight.bold,
                  }}
                >
                  YES
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
