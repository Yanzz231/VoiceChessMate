import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { HomeIcon } from "@/components/icons/tabs/HomeIcon";
import { PlayIcon } from "@/components/icons/tabs/PlayIcon";
import { ScanIcon } from "@/components/icons/tabs/ScanIcon";
import { AnalyzeIcon } from "@/components/icons/tabs/AnalyzeIcon";
import { SettingsIcon } from "@/components/icons/tabs/SettingsIcon";
import Svg, { Path, Circle } from "react-native-svg";

const ProfileIcon = ({ size = 24, color = WCAGColors.neutral.gray600, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill={focused ? color : "none"} fillOpacity={focused ? 0.2 : 0} />
    <Path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

type TabType = "home" | "play" | "scan" | "analyze" | "profile";

interface TabBarProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);

  useEffect(() => {
    const loadSettings = async () => {
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      const speed = await AsyncStorage.getItem("tts_speed");
      setVoiceModeEnabled(voiceMode === "true");
      setTtsSpeed(speed ? parseFloat(speed) : 1.0);
    };
    loadSettings();
  }, []);

  const handleTabPress = async (tab: TabType) => {
    if (voiceModeEnabled) {
      const speed = await AsyncStorage.getItem("tts_speed");
      const rate = speed ? parseFloat(speed) : 1.0;

      let message = "";
      switch (tab) {
        case "home":
          message = "Going to Home page";
          break;
        case "play":
          message = "Going to Play with AI";
          break;
        case "scan":
          message = "Going to Scan";
          break;
        case "analyze":
          message = "Going to Analyze";
          break;
        case "profile":
          message = "Going to Profile";
          break;
      }

      if (message) {
        Speech.speak(message, { rate });
      }
    }
    onTabPress(tab);
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: WCAGColors.neutral.white,
        paddingBottom: 10,
        paddingTop: 14,
        paddingHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
        borderTopLeftRadius: AccessibilitySizes.radius.xl,
        borderTopRightRadius: AccessibilitySizes.radius.xl,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => handleTabPress("home")}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Home"
        >
          <HomeIcon
            size={26}
            color={
              activeTab === "home"
                ? WCAGColors.primary.yellow
                : WCAGColors.neutral.gray600
            }
            focused={activeTab === "home"}
          />
          <Text
            style={{
              fontSize: 11,
              marginTop: 5,
              color:
                activeTab === "home"
                  ? WCAGColors.primary.yellow
                  : WCAGColors.neutral.gray600,
              fontWeight:
                activeTab === "home"
                  ? AccessibilitySizes.fontWeight.bold
                  : AccessibilitySizes.fontWeight.normal,
            }}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabPress("play")}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Play with AI"
        >
          <PlayIcon
            size={26}
            color={
              activeTab === "play"
                ? WCAGColors.primary.yellow
                : WCAGColors.neutral.gray600
            }
            focused={activeTab === "play"}
          />
          <Text
            style={{
              fontSize: 11,
              marginTop: 5,
              color:
                activeTab === "play"
                  ? WCAGColors.primary.yellow
                  : WCAGColors.neutral.gray600,
              fontWeight:
                activeTab === "play"
                  ? AccessibilitySizes.fontWeight.bold
                  : AccessibilitySizes.fontWeight.normal,
            }}
          >
            Play AI
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => handleTabPress("scan")}
            style={{
              marginTop: -38,
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Scan"
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: WCAGColors.primary.yellow,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: WCAGColors.primary.yellow,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.45,
                shadowRadius: 14,
                elevation: 12,
                borderWidth: 6,
                borderColor: WCAGColors.neutral.white,
              }}
            >
              <ScanIcon
                size={36}
                color={WCAGColors.neutral.white}
                focused={true}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => handleTabPress("analyze")}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Analyze"
        >
          <AnalyzeIcon
            size={26}
            color={
              activeTab === "analyze"
                ? WCAGColors.primary.yellow
                : WCAGColors.neutral.gray600
            }
            focused={activeTab === "analyze"}
          />
          <Text
            style={{
              fontSize: 11,
              marginTop: 5,
              color:
                activeTab === "analyze"
                  ? WCAGColors.primary.yellow
                  : WCAGColors.neutral.gray600,
              fontWeight:
                activeTab === "analyze"
                  ? AccessibilitySizes.fontWeight.bold
                  : AccessibilitySizes.fontWeight.normal,
            }}
          >
            Analyze
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabPress("profile")}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Profile"
        >
          <ProfileIcon
            size={26}
            color={
              activeTab === "profile"
                ? WCAGColors.primary.yellow
                : WCAGColors.neutral.gray600
            }
            focused={activeTab === "profile"}
          />
          <Text
            style={{
              fontSize: 11,
              marginTop: 5,
              color:
                activeTab === "profile"
                  ? WCAGColors.primary.yellow
                  : WCAGColors.neutral.gray600,
              fontWeight:
                activeTab === "profile"
                  ? AccessibilitySizes.fontWeight.bold
                  : AccessibilitySizes.fontWeight.normal,
            }}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
