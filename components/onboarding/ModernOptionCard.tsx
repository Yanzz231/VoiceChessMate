import React, { ReactNode, useEffect, useState } from "react";
import { TouchableOpacity, Text, View, Animated, AccessibilityInfo } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LinearGradient } from "expo-linear-gradient";
import { speak } from "@/utils/speechUtils";
import { Ionicons } from "@expo/vector-icons";

interface ModernOptionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  autoSpeak?: boolean;
}

export const ModernOptionCard: React.FC<ModernOptionCardProps> = ({
  icon,
  title,
  description,
  selected,
  onPress,
  autoSpeak = true,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [checkAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (selected) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 50,
          friction: 3,
        }),
        Animated.spring(checkAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 5,
        }),
      ]).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(checkAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selected]);

  const handlePress = () => {
    const announcement = `${title}${description ? `. ${description}` : ''}`;

    if (autoSpeak) {
      speak(announcement);
    }

    AccessibilityInfo.announceForAccessibility(announcement);

    onPress();
  };

  const borderColor = selected ? WCAGColors.primary.yellow : WCAGColors.neutral.gray200;
  const bgColor = selected ? WCAGColors.primary.yellowBg : WCAGColors.neutral.white;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: AccessibilitySizes.spacing.md,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={{
          borderRadius: 16,
          overflow: 'visible',
        }}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${title}${description ? `, ${description}` : ''}`}
        accessibilityHint={selected ? 'Terpilih' : 'Ketuk dua kali untuk memilih'}
      >
      <View
        style={{
          borderWidth: 2.5,
          borderColor: borderColor,
          borderRadius: 16,
          backgroundColor: bgColor,
          shadowColor: selected ? WCAGColors.primary.yellow : '#000',
          shadowOffset: { width: 0, height: selected ? 6 : 2 },
          shadowOpacity: selected ? 0.25 : 0.08,
          shadowRadius: selected ? 12 : 4,
          elevation: selected ? 6 : 2,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: AccessibilitySizes.spacing.lg,
            minHeight: AccessibilitySizes.minTouchTargetLarge,
          }}
        >
          {/* Icon Container */}
          <View
            style={{
              marginRight: AccessibilitySizes.spacing.md,
            }}
          >
            {icon}
          </View>

          {/* Text Content */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: AccessibilitySizes.text.md,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: selected ? WCAGColors.primary.yellowDark : WCAGColors.neutral.gray900,
                marginBottom: description ? 2 : 0,
              }}
            >
              {title}
            </Text>
            {description && (
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.sm,
                  fontWeight: AccessibilitySizes.fontWeight.normal,
                  color: WCAGColors.neutral.gray600,
                  lineHeight: 18,
                }}
              >
                {description}
              </Text>
            )}
          </View>

          {/* Checkmark Indicator */}
          <Animated.View
            style={{
              opacity: checkAnim,
              transform: [
                {
                  scale: checkAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1],
                  }),
                },
                {
                  rotate: checkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: AccessibilitySizes.spacing.sm,
                backgroundColor: '#27AE60',
                shadowColor: '#27AE60',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
};
