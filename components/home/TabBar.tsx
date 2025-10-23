import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { HomeIcon } from "@/components/icons/tabs/HomeIcon";
import { PlayIcon } from "@/components/icons/tabs/PlayIcon";
import { ScanIcon } from "@/components/icons/tabs/ScanIcon";
import { AnalyzeIcon } from "@/components/icons/tabs/AnalyzeIcon";
import { SettingsIcon } from "@/components/icons/tabs/SettingsIcon";

type TabType = "home" | "play" | "scan" | "analyze" | "settings";

interface TabBarProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
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
          onPress={() => onTabPress("home")}
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
          onPress={() => onTabPress("play")}
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
            onPress={() => onTabPress("scan")}
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
          onPress={() => onTabPress("analyze")}
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
          onPress={() => onTabPress("settings")}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <SettingsIcon
            size={26}
            color={
              activeTab === "settings"
                ? WCAGColors.primary.yellow
                : WCAGColors.neutral.gray600
            }
            focused={activeTab === "settings"}
          />
          <Text
            style={{
              fontSize: 11,
              marginTop: 5,
              color:
                activeTab === "settings"
                  ? WCAGColors.primary.yellow
                  : WCAGColors.neutral.gray600,
              fontWeight:
                activeTab === "settings"
                  ? AccessibilitySizes.fontWeight.bold
                  : AccessibilitySizes.fontWeight.normal,
            }}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
