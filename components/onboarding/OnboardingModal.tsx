import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingModalProps {
  visible: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextButtonText?: string;
  showBackButton?: boolean;
  showSkipButton?: boolean;
  nextButtonDisabled?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  title,
  description,
  children,
  onNext,
  onBack,
  onSkip,
  nextButtonText = 'Next',
  showBackButton = false,
  showSkipButton = false,
  nextButtonDisabled = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: width * 0.9,
            maxWidth: 500,
            backgroundColor: WCAGColors.neutral.white,
            borderRadius: AccessibilitySizes.radius.xl,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={WCAGColors.gradients.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: AccessibilitySizes.spacing.lg,
              paddingHorizontal: AccessibilitySizes.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.xl,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.white,
                textAlign: 'center',
                textShadowColor: 'rgba(0, 0, 0, 0.15)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {description && (
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.sm,
                  fontWeight: AccessibilitySizes.fontWeight.medium,
                  color: WCAGColors.neutral.white,
                  textAlign: 'center',
                  marginTop: 6,
                  opacity: 0.95,
                }}
              >
                {description}
              </Text>
            )}
          </LinearGradient>

          {/* Content area */}
          <ScrollView
            style={{
              maxHeight: 420,
            }}
            contentContainerStyle={{
              padding: AccessibilitySizes.spacing.md,
              paddingTop: AccessibilitySizes.spacing.lg,
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Action buttons */}
          <View
            style={{
              padding: AccessibilitySizes.spacing.md,
              borderTopWidth: 1,
              borderTopColor: WCAGColors.neutral.gray200,
              backgroundColor: WCAGColors.neutral.gray50,
            }}
          >
            {/* Next/Submit button */}
            {onNext && (
              <TouchableOpacity
                onPress={onNext}
                disabled={nextButtonDisabled}
                style={{
                  minHeight: AccessibilitySizes.minTouchTarget,
                  borderRadius: AccessibilitySizes.radius.md,
                  overflow: 'hidden',
                  marginBottom:
                    showBackButton || showSkipButton
                      ? AccessibilitySizes.spacing.sm
                      : 0,
                  opacity: nextButtonDisabled ? 0.5 : 1,
                }}
                accessibilityRole="button"
                accessibilityLabel={nextButtonText}
                accessibilityHint={
                  nextButtonDisabled
                    ? 'This button is disabled. Please complete the required fields.'
                    : `Tap to ${nextButtonText.toLowerCase()}`
                }
              >
                <LinearGradient
                  colors={
                    nextButtonDisabled
                      ? [WCAGColors.neutral.gray300, WCAGColors.neutral.gray300]
                      : (WCAGColors.gradients.primary as any)
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.md,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                      color: WCAGColors.neutral.white,
                    }}
                  >
                    {nextButtonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Back and Skip buttons row */}
            {(showBackButton || showSkipButton) && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: AccessibilitySizes.spacing.sm,
                }}
              >
                {showBackButton && onBack && (
                  <TouchableOpacity
                    onPress={onBack}
                    style={{
                      flex: 1,
                      minHeight: AccessibilitySizes.minTouchTarget,
                      borderRadius: AccessibilitySizes.radius.md,
                      borderWidth: 2,
                      borderColor: WCAGColors.secondary.blue,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: WCAGColors.neutral.white,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                  >
                    <Text
                      style={{
                        fontSize: AccessibilitySizes.text.sm,
                        fontWeight: AccessibilitySizes.fontWeight.semibold,
                        color: WCAGColors.secondary.blueDark,
                      }}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                )}

                {showSkipButton && onSkip && (
                  <TouchableOpacity
                    onPress={onSkip}
                    style={{
                      flex: 1,
                      minHeight: AccessibilitySizes.minTouchTarget,
                      borderRadius: AccessibilitySizes.radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: WCAGColors.neutral.gray200,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Skip this step"
                  >
                    <Text
                      style={{
                        fontSize: AccessibilitySizes.text.sm,
                        fontWeight: AccessibilitySizes.fontWeight.semibold,
                        color: WCAGColors.neutral.gray700,
                      }}
                    >
                      Skip
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
