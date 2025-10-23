import React, { useEffect, useState } from 'react';
import { Image, ImageProps, TouchableOpacity, View } from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_STORAGE_KEYS } from '@/constants/storageKeys';

interface AccessibleImageProps extends ImageProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress?: () => void;
  customAnnouncement?: string;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  accessibilityLabel,
  accessibilityHint,
  onPress,
  customAnnouncement,
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
    const announcement = customAnnouncement || accessibilityLabel;

    if (voiceModeEnabled && announcement) {
      Speech.speak(announcement, { language: 'id-ID' });
    }

    if (onPress) {
      onPress();
    }
  };

  if (!onPress) {
    return (
      <View
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="image"
      >
        <Image
          style={style}
          {...props}
          accessible={false}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="imagebutton"
    >
      <Image
        style={style}
        {...props}
        accessible={false}
      />
    </TouchableOpacity>
  );
};
