import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { HomeIcon, PlayIcon, ScanIcon, AnalyzeIcon, SettingsIcon } from "@/components/icons/tabs";
import { TabType } from "@/types/lesson";

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
        borderTopWidth: 1,
        borderTopColor: WCAGColors.neutral.gray200,
        paddingBottom: 10,
        paddingTop: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 16,
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
            accessibilityLabel="Scan chess board"
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: WCAGColors.primary.yellow,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 12,
                borderWidth: 5,
                borderColor: WCAGColors.neutral.white,
              }}
            >
              <ScanIcon
                size={32}
                color={WCAGColors.neutral.white}
                focused={activeTab === "scan"}
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
          accessibilityLabel="Analyze games"
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
