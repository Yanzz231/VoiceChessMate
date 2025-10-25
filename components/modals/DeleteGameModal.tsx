import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface DeleteGameModalProps {
  visible: boolean;
  gameName: string;
  voiceModeEnabled: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onTextPress?: (text: string) => void;
}

export const DeleteGameModal: React.FC<DeleteGameModalProps> = ({
  visible,
  gameName,
  voiceModeEnabled,
  onClose,
  onConfirm,
  onTextPress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: WCAGColors.neutral.white,
            borderRadius: AccessibilitySizes.radius.xl,
            padding: 24,
            width: "100%",
            maxWidth: 400,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: WCAGColors.semantic.errorBg,
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="trash-outline"
              size={32}
              color={WCAGColors.semantic.error}
            />
          </View>

          {/* Title */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (voiceModeEnabled && onTextPress) {
                onTextPress("Delete Game");
              }
            }}
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
              Delete Game
            </Text>
          </TouchableOpacity>

          {/* Message */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (voiceModeEnabled && onTextPress) {
                onTextPress(`Are you sure you want to delete ${gameName}? This action cannot be undone.`);
              }
            }}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.base,
                color: WCAGColors.neutral.gray600,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 24,
              }}
            >
              Are you sure you want to delete{" "}
              <Text style={{ fontWeight: AccessibilitySizes.fontWeight.semibold }}>
                {gameName}
              </Text>
              ? This action cannot be undone.
            </Text>
          </TouchableOpacity>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => {
                if (voiceModeEnabled && onTextPress) {
                  onTextPress("Deleting game");
                }
                onConfirm();
              }}
              style={{
                backgroundColor: WCAGColors.semantic.error,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: AccessibilitySizes.radius.lg,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minHeight: AccessibilitySizes.minTouchTarget,
              }}
            >
              <Ionicons
                name="trash"
                size={20}
                color={WCAGColors.neutral.white}
              />
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.lg,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.white,
                  marginLeft: 8,
                }}
              >
                Delete Game
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => {
                if (voiceModeEnabled && onTextPress) {
                  onTextPress("Delete cancelled");
                }
                onClose();
              }}
              style={{
                backgroundColor: WCAGColors.neutral.gray100,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: AccessibilitySizes.radius.lg,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minHeight: AccessibilitySizes.minTouchTarget,
              }}
            >
              <Ionicons
                name="close"
                size={20}
                color={WCAGColors.neutral.gray700}
              />
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.lg,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.gray700,
                  marginLeft: 8,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
