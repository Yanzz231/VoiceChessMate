import React, { useEffect, useState } from 'react';
import { View, ViewProps, TouchableOpacity, AccessibilityRole } from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_STORAGE_KEYS } from '@/constants/storageKeys';

interface AccessibleCardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  disabled?: boolean;
  activeOpacity?: number;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  activeOpacity = 0.8,
  style,
  ...props
}) => {
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);

  useEffect(() => {
    const loadVoiceMode = async () => {
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      setVoiceModeEnabled(voiceMode === 'true');
    };
    loadVoiceMode();
  }, []);

  const handlePress = () => {
    if (disabled) return;

    if (voiceModeEnabled && accessibilityLabel) {
      Speech.speak(accessibilityLabel, { language: 'id-ID' });
    }

    if (onPress) {
      onPress();
    }
  };

  if (!onPress && !disabled) {
    return (
      <View
        style={style}
        {...props}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
      >
        {children}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={style}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled }}
    >
      <View {...props} importantForAccessibility="no">
        {children}
      </View>
    </TouchableOpacity>
  );
};
