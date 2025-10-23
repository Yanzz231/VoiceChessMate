import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, AccessibilityInfo } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LinearGradient } from "expo-linear-gradient";
import { speak } from "@/utils/speechUtils";
import { Ionicons } from "@expo/vector-icons";

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AccessibleAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  autoAnnounce?: boolean;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  visible,
  type,
  title,
  message,
  primaryButtonText = "OK",
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  autoAnnounce = true,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      if (autoAnnounce) {
        const announcement = `${getAlertTypeText(type)}. ${title}. ${message}`;
        AccessibilityInfo.announceForAccessibility(announcement);
        speak(announcement);
      }
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, title, message, type, autoAnnounce]);

  const getAlertTypeText = (alertType: AlertType): string => {
    switch (alertType) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      case 'confirm': return 'Confirmation';
      default: return 'Notification';
    }
  };

  const getIconConfig = (alertType: AlertType) => {
    switch (alertType) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#27AE60', bgColor: '#E8F8F0' };
      case 'error':
        return { name: 'close-circle' as const, color: '#E74C3C', bgColor: '#FDEDEC' };
      case 'warning':
        return { name: 'warning' as const, color: '#F39C12', bgColor: '#FEF5E7' };
      case 'info':
        return { name: 'information-circle' as const, color: WCAGColors.primary.yellow, bgColor: '#FEF9E7' };
      case 'confirm':
        return { name: 'help-circle' as const, color: WCAGColors.primary.yellow, bgColor: '#FEF9E7' };
      default:
        return { name: 'information-circle' as const, color: WCAGColors.primary.yellow, bgColor: '#FEF9E7' };
    }
  };

  const getPrimaryButtonColors = (alertType: AlertType): string[] => {
    switch (alertType) {
      case 'success':
        return ['#27AE60', '#229954'];
      case 'error':
      case 'warning':
        return ['#E74C3C', '#C0392B'];
      default:
        return [WCAGColors.primary.yellowLight, WCAGColors.primary.yellow];
    }
  };


  const iconConfig = getIconConfig(type);
  const primaryColors = getPrimaryButtonColors(type);
  const hasSecondaryButton = secondaryButtonText && onSecondaryPress;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSecondaryPress || onPrimaryPress}
      accessibilityViewIsModal={true}
      accessible={true}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onSecondaryPress || onPrimaryPress}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: AccessibilitySizes.spacing.xl,
        }}
        accessibilityLabel="Tutup dialog dengan menekan di luar"
        accessibilityRole="button"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: '100%',
            maxWidth: 400,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: WCAGColors.neutral.white,
              borderRadius: 24,
              padding: AccessibilitySizes.spacing.xl,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 15,
            }}
            accessible={false}
          >
            {/* Icon */}
            <View
              style={{
                alignItems: 'center',
                marginBottom: AccessibilitySizes.spacing.lg,
              }}
              accessible={true}
              accessibilityLabel={`${getAlertTypeText(type)} icon`}
              accessibilityRole="image"
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: iconConfig.bgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={iconConfig.name} size={48} color={iconConfig.color} />
              </View>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: AccessibilitySizes.text.xxl,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.gray900,
                textAlign: 'center',
                marginBottom: AccessibilitySizes.spacing.sm,
              }}
              accessible={true}
              accessibilityLabel={`Judul: ${title}`}
              accessibilityRole="header"
            >
              {title}
            </Text>

            {/* Message */}
            <Text
              style={{
                fontSize: AccessibilitySizes.text.base,
                fontWeight: AccessibilitySizes.fontWeight.normal,
                color: WCAGColors.neutral.gray600,
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: AccessibilitySizes.spacing.xl,
              }}
              accessible={true}
              accessibilityLabel={`Pesan: ${message}`}
              accessibilityRole="text"
            >
              {message}
            </Text>

            {/* Buttons */}
            <View style={{ gap: AccessibilitySizes.spacing.md }}>
              {/* Primary Button */}
              <TouchableOpacity
                onPress={() => {
                  speak(primaryButtonText);
                  onPrimaryPress();
                }}
                style={{
                  minHeight: AccessibilitySizes.minTouchTargetLarge,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={primaryButtonText}
                accessibilityHint={`Tekan untuk ${primaryButtonText.toLowerCase()}`}
              >
                <LinearGradient
                  colors={primaryColors as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    minHeight: AccessibilitySizes.minTouchTargetLarge,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 16,
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
                    {primaryButtonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary Button */}
              {hasSecondaryButton && (
                <TouchableOpacity
                  onPress={() => {
                    speak(secondaryButtonText);
                    onSecondaryPress();
                  }}
                  style={{
                    minHeight: AccessibilitySizes.minTouchTargetLarge,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: WCAGColors.neutral.gray100,
                    borderWidth: 2,
                    borderColor: WCAGColors.neutral.gray300,
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={secondaryButtonText}
                  accessibilityHint={`Tekan untuk ${secondaryButtonText.toLowerCase()}`}
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.md,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                      color: WCAGColors.neutral.gray800,
                    }}
                    importantForAccessibility="no"
                  >
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};
