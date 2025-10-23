import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface OptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  selected,
  onPress,
  icon,
  accessibilityLabel,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        minHeight: AccessibilitySizes.minTouchTarget,
        borderRadius: AccessibilitySizes.radius.lg,
        borderWidth: 3,
        borderColor: selected
          ? WCAGColors.primary.yellow
          : WCAGColors.neutral.gray200,
        backgroundColor: selected
          ? WCAGColors.primary.yellowBg
          : WCAGColors.neutral.white,
        padding: AccessibilitySizes.spacing.md,
        marginBottom: AccessibilitySizes.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: selected ? 0.15 : 0.05,
        shadowRadius: 8,
        elevation: selected ? 4 : 2,
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ selected }}
      accessibilityHint={
        selected
          ? 'Selected. Tap to deselect.'
          : 'Not selected. Tap to select this option.'
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && (
          <View
            style={{
              marginRight: AccessibilitySizes.spacing.md,
            }}
          >
            {icon}
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: selected ? 'bold' : '600',
              color: selected
                ? WCAGColors.neutral.gray900
                : WCAGColors.neutral.gray700,
              marginBottom: description ? AccessibilitySizes.spacing.xs : 0,
            }}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={{
                fontSize: AccessibilitySizes.text.sm,
                color: WCAGColors.neutral.gray700,
                lineHeight: 20,
              }}
            >
              {description}
            </Text>
          )}
        </View>
        {/* Selection indicator */}
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 3,
            borderColor: selected
              ? WCAGColors.primary.yellow
              : WCAGColors.neutral.gray300,
            backgroundColor: selected
              ? WCAGColors.primary.yellow
              : WCAGColors.neutral.white,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: AccessibilitySizes.spacing.sm,
          }}
        >
          {selected && (
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: WCAGColors.neutral.white,
              }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
