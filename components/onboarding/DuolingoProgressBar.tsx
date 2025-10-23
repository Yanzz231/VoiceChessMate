import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import React from 'react';
import { View } from 'react-native';

interface DuolingoProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const DuolingoProgressBar: React.FC<DuolingoProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View
      style={{
        width: '100%',
        height: 8,
        backgroundColor: WCAGColors.neutral.gray200,
        borderRadius: AccessibilitySizes.radius.full,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: WCAGColors.primary.yellow,
          borderRadius: AccessibilitySizes.radius.full,
        }}
      />
    </View>
  );
};
