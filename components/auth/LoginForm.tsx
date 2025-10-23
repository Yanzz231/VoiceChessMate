import { GoogleSvg } from "@/components/icons/Google";
import { ChessIllustration } from "@/components/icons/ChessIllustration";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { speak } from "@/utils/speechUtils";

interface LoginFormProps {
  loading: boolean;
  onSignInPress: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  loading,
  onSignInPress,
}) => {

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: AccessibilitySizes.spacing.xl,
      }}
    >
      {/* Top Section - Illustration & Title */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: AccessibilitySizes.spacing.xxl,
        }}
      >
        <TouchableOpacity
          onPress={() => speak('Welcome to ChessMate. Play chess with your voice. Accessible for everyone.')}
          activeOpacity={0.8}
        >
          {/* Welcome Text */}
          <Text
            style={{
              fontSize: AccessibilitySizes.text.sm,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: WCAGColors.neutral.white,
              textAlign: 'center',
              marginBottom: AccessibilitySizes.spacing.md,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              opacity: 0.9,
            }}
          >
            WELCOME TO
          </Text>

          {/* Illustration */}
          <View style={{ marginBottom: AccessibilitySizes.spacing.lg }}>
            <ChessIllustration width={280} height={220} />
          </View>

          {/* App Name */}
          <Text
            style={{
              fontSize: 38,
              fontWeight: AccessibilitySizes.fontWeight.extrabold,
              color: WCAGColors.neutral.white,
              textAlign: 'center',
              marginBottom: AccessibilitySizes.spacing.xs,
              letterSpacing: -0.5,
            }}
          >
            ChessMate
          </Text>

          {/* Tagline */}
          <Text
            style={{
              fontSize: AccessibilitySizes.text.base,
              fontWeight: AccessibilitySizes.fontWeight.medium,
              color: WCAGColors.neutral.white,
              textAlign: 'center',
              opacity: 0.85,
              lineHeight: 22,
              paddingHorizontal: AccessibilitySizes.spacing.lg,
            }}
          >
            Play chess with your voice.{'\n'}Accessible for everyone.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section - CTA */}
      <View
        style={{
          paddingBottom: AccessibilitySizes.spacing.xxl,
        }}
      >
        {/* Sign In Button */}
        <TouchableOpacity
          onPress={() => {
            speak(loading ? 'Signing in...' : 'Sign in with Google');
            onSignInPress();
          }}
          disabled={loading}
          style={{
            minHeight: AccessibilitySizes.minTouchTargetLarge,
            borderRadius: 14,
            backgroundColor: WCAGColors.neutral.white,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            marginBottom: AccessibilitySizes.spacing.md,
          }}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
        >
          <LinearGradient
            colors={[WCAGColors.neutral.white, '#F8F9FA']}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: AccessibilitySizes.minTouchTargetLarge,
              borderRadius: 14,
              gap: 10,
            }}
          >
            {loading ? (
              <ActivityIndicator color={WCAGColors.primary.yellow} size="small" />
            ) : (
              <GoogleSvg height={22} width={22} />
            )}
            <Text
              style={{
                fontSize: 16,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.gray900,
                letterSpacing: -0.3,
              }}
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Help Text */}
        <Text
          style={{
            fontSize: AccessibilitySizes.text.xs,
            fontWeight: AccessibilitySizes.fontWeight.medium,
            color: WCAGColors.neutral.white,
            textAlign: 'center',
            opacity: 0.7,
            lineHeight: 18,
          }}
        >
          Free for everyone
        </Text>
      </View>
    </View>
  );
};
