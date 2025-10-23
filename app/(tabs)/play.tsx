import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import { speak } from '@/utils/speechUtils';

export default function PlayScreen() {
  useEffect(() => {
    speak('Play with AI. Start a chess game against the computer.');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WCAGColors.neutral.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={WCAGColors.neutral.white} />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: AccessibilitySizes.spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: AccessibilitySizes.text.xl,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.neutral.gray900,
            textAlign: 'center',
          }}
        >
          Play with AI
        </Text>
        <Text
          style={{
            fontSize: AccessibilitySizes.text.md,
            color: WCAGColors.neutral.gray600,
            textAlign: 'center',
            marginTop: AccessibilitySizes.spacing.md,
          }}
        >
          Coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
