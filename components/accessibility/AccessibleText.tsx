import React, { useEffect, useState } from 'react';
import { Text, TextProps, TouchableOpacity, AccessibilityRole } from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_STORAGE_KEYS } from '@/constants/storageKeys';

interface AccessibleTextProps extends TextProps {
  children: React.ReactNode;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  customAnnouncement?: string;
  onPress?: () => void;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  accessibilityHint,
  accessibilityRole = 'text',
  customAnnouncement,
  onPress,
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

  const getTextContent = (): string => {
    if (customAnnouncement) return customAnnouncement;
    if (typeof children === 'string') return children;
    if (typeof children === 'number') return children.toString();

    const extractText = (node: any): string => {
      if (!node) return '';
      if (typeof node === 'string' || typeof node === 'number') return node.toString();
      if (Array.isArray(node)) return node.map(extractText).join(' ');
      if (node.props?.children) return extractText(node.props.children);
      return '';
    };

    return extractText(children);
  };

  const handlePress = () => {
    const textContent = getTextContent();
    if (voiceModeEnabled && textContent) {
      Speech.speak(textContent, { language: 'id-ID' });
    }
    if (onPress) {
      onPress();
    }
  };

  const textContent = getTextContent();
  const accessibilityLabel = textContent;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
    >
      <Text style={style} {...props} importantForAccessibility="no">
        {children}
      </Text>
    </TouchableOpacity>
  );
};
