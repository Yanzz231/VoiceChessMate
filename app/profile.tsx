import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { useAuth } from "@/hooks/useAuth";
import Svg, { Path, Circle } from "react-native-svg";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profileData = await AsyncStorage.getItem(USER_STORAGE_KEYS.PROFILE);
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    };
    loadProfile();
    speak("Profile. Your account information.");
  }, []);

  const handleSignOut = async () => {
    speak("Signing out.");
    await signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: WCAGColors.primary.yellowBg }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WCAGColors.primary.yellowBg}
      />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: AccessibilitySizes.spacing.lg,
          paddingTop: AccessibilitySizes.spacing.md,
          paddingBottom: AccessibilitySizes.spacing.md,
          backgroundColor: WCAGColors.neutral.white,
          borderBottomLeftRadius: AccessibilitySizes.radius.lg,
          borderBottomRightRadius: AccessibilitySizes.radius.lg,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{
            marginRight: AccessibilitySizes.spacing.md,
          }}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke={WCAGColors.neutral.gray900}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: AccessibilitySizes.text.xxl,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.neutral.gray900,
          }}
        >
          Profile
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: AccessibilitySizes.spacing.lg,
        }}
      >
        {/* Profile Avatar */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: WCAGColors.primary.yellow,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 5,
              borderColor: WCAGColors.neutral.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontSize: 48,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.white,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.xl,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.gray900,
              marginTop: 16,
            }}
          >
            {user?.email?.split("@")[0] || "User"}
          </Text>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.sm,
              color: WCAGColors.neutral.gray600,
              marginTop: 4,
            }}
          >
            {user?.email || "No email"}
          </Text>
        </View>

        {/* Stats */}
        <View
          style={{
            backgroundColor: WCAGColors.neutral.white,
            borderRadius: AccessibilitySizes.radius.lg,
            padding: AccessibilitySizes.spacing.lg,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.gray900,
              marginBottom: 16,
            }}
          >
            Your Stats
          </Text>
          <View style={{ gap: 12 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  color: WCAGColors.neutral.gray600,
                }}
              >
                Lessons Completed
              </Text>
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.primary.yellow,
                }}
              >
                0
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  color: WCAGColors.neutral.gray600,
                }}
              >
                Total Stars
              </Text>
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.primary.yellow,
                }}
              >
                0
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: WCAGColors.semantic.error,
            paddingVertical: 16,
            borderRadius: AccessibilitySizes.radius.md,
            minHeight: AccessibilitySizes.minTouchTarget,
            justifyContent: "center",
            shadowColor: WCAGColors.semantic.error,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text
            style={{
              color: WCAGColors.neutral.white,
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              textAlign: "center",
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
