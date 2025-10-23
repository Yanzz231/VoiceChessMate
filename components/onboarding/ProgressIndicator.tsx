import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import React from 'react';
import { View, Text } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  return (
    <View
      style={{
        paddingHorizontal: AccessibilitySizes.spacing.lg,
        paddingVertical: AccessibilitySizes.spacing.md,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: AccessibilitySizes.spacing.sm,
        }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={{
                alignItems: 'center',
                flex: 1,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor:
                    index < currentStep
                      ? WCAGColors.primary.yellow
                      : index === currentStep
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray200,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor:
                    index === currentStep
                      ? WCAGColors.primary.yellowDark
                      : 'transparent',
                }}
                accessibilityLabel={`Step ${index + 1} of ${totalSteps}${
                  index < currentStep
                    ? ', completed'
                    : index === currentStep
                    ? ', current'
                    : ', upcoming'
                }`}
              >
                {index < currentStep ? (
                  <Text
                    style={{
                      color: WCAGColors.neutral.white,
                      fontSize: AccessibilitySizes.text.base,
                      fontWeight: 'bold',
                    }}
                  >
                    ✓
                  </Text>
                ) : (
                  <Text
                    style={{
                      color:
                        index === currentStep
                          ? WCAGColors.neutral.white
                          : WCAGColors.neutral.gray400,
                      fontSize: AccessibilitySizes.text.sm,
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {stepLabels && stepLabels[index] && (
                <Text
                  style={{
                    marginTop: AccessibilitySizes.spacing.xs,
                    fontSize: AccessibilitySizes.text.xs,
                    color:
                      index === currentStep
                        ? WCAGColors.neutral.gray900
                        : WCAGColors.neutral.gray600,
                    fontWeight: index === currentStep ? '600' : 'normal',
                    textAlign: 'center',
                  }}
                >
                  {stepLabels[index]}
                </Text>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={{
                  height: 3,
                  flex: 1,
                  backgroundColor:
                    index < currentStep
                      ? WCAGColors.primary.yellow
                      : WCAGColors.neutral.gray200,
                  marginHorizontal: 4,
                  marginBottom: stepLabels ? 20 : 0,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      <Text
        style={{
          fontSize: AccessibilitySizes.text.sm,
          color: WCAGColors.neutral.gray700,
          textAlign: 'center',
          marginTop: AccessibilitySizes.spacing.xs,
        }}
      >
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
};
