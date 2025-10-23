import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface AgeSelectorProps {
  age: string;
  onAgeChange: (age: string) => void;
}

export const AgeSelector: React.FC<AgeSelectorProps> = ({
  age,
  onAgeChange,
}) => {
  const handleAgeChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '' || (parseInt(numericValue) >= 0 && parseInt(numericValue) <= 120)) {
      onAgeChange(numericValue);
    }
  };

  const ageNum = age ? parseInt(age) : 0;
  let ageGroup = '';
  if (ageNum > 0 && ageNum < 13) {
    ageGroup = 'Child';
  } else if (ageNum >= 13 && ageNum < 18) {
    ageGroup = 'Teenager';
  } else if (ageNum >= 18) {
    ageGroup = 'Adult';
  }

  return (
    <View>
      <Text
        style={{
          fontSize: AccessibilitySizes.text.lg,
          fontWeight: '600',
          color: WCAGColors.neutral.gray900,
          marginBottom: AccessibilitySizes.spacing.sm,
        }}
      >
        How old are you?
      </Text>
      <Text
        style={{
          fontSize: AccessibilitySizes.text.base,
          color: WCAGColors.neutral.gray700,
          marginBottom: AccessibilitySizes.spacing.md,
          lineHeight: 24,
        }}
      >
        This helps us customize the experience just for you!
      </Text>

      <View
        style={{
          borderRadius: AccessibilitySizes.radius.lg,
          borderWidth: 3,
          borderColor: age
            ? WCAGColors.primary.yellow
            : WCAGColors.neutral.gray200,
          backgroundColor: WCAGColors.neutral.white,
          overflow: 'hidden',
        }}
      >
        <TextInput
          value={age}
          onChangeText={handleAgeChange}
          placeholder="Enter your age"
          placeholderTextColor={WCAGColors.interaction.disabledText}
          keyboardType="number-pad"
          maxLength={3}
          style={{
            fontSize: AccessibilitySizes.text.xl,
            fontWeight: 'bold',
            color: WCAGColors.neutral.gray900,
            padding: AccessibilitySizes.spacing.md,
            minHeight: AccessibilitySizes.minTouchTarget,
            textAlign: 'center',
          }}
          accessibilityLabel="Age input"
          accessibilityHint="Enter your age in years"
        />
      </View>

      {ageGroup !== '' && (
        <View
          style={{
            marginTop: AccessibilitySizes.spacing.md,
            padding: AccessibilitySizes.spacing.md,
            backgroundColor: WCAGColors.primary.yellowBg,
            borderRadius: AccessibilitySizes.radius.md,
            borderLeftWidth: 4,
            borderLeftColor: WCAGColors.primary.yellow,
          }}
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.base,
              color: WCAGColors.neutral.gray800,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            Age Group: {ageGroup}
          </Text>
        </View>
      )}
    </View>
  );
};
