import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";

interface HomeHeaderProps {
  userName: string;
  completedCount: number;
  totalLessons: number;
  onTextPress: (text: string) => void;
  onProfilePress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  completedCount,
  totalLessons,
  onTextPress,
  onProfilePress,
}) => {
  return (
    <View
      style={{
        paddingHorizontal: AccessibilitySizes.spacing.lg,
        paddingTop: AccessibilitySizes.spacing.md,
        paddingBottom: AccessibilitySizes.spacing.md,
        backgroundColor: WCAGColors.neutral.white,
        borderBottomLeftRadius: AccessibilitySizes.radius.xl,
        borderBottomRightRadius: AccessibilitySizes.radius.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => onTextPress(`Hello, ${userName}`)}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontSize: AccessibilitySizes.text.lg,
              fontWeight: AccessibilitySizes.fontWeight.semibold,
              color: WCAGColors.neutral.gray600,
            }}
          >
            Hello,
          </Text>
          <Text
            style={{
              fontSize: AccessibilitySizes.text.xxl,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.gray900,
            }}
          >
            {userName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: WCAGColors.primary.yellow,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 3,
            borderColor: WCAGColors.primary.yellowLight,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View profile"
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.neutral.white,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          onTextPress(
            `You have completed ${completedCount} out of ${totalLessons} lessons`
          )
        }
        style={{
          backgroundColor: WCAGColors.primary.yellowBg,
          borderRadius: AccessibilitySizes.radius.md,
          padding: 14,
          flexDirection: "row",
          justifyContent: "space-around",
          borderWidth: 2,
          borderColor: WCAGColors.primary.yellowLight,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.primary.yellow,
            }}
          >
            {completedCount}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: WCAGColors.neutral.gray600,
              marginTop: 2,
            }}
          >
            Completed
          </Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: WCAGColors.primary.yellowLight,
          }}
        />
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: AccessibilitySizes.fontWeight.bold,
              color: WCAGColors.primary.yellow,
            }}
          >
            {totalLessons}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: WCAGColors.neutral.gray600,
              marginTop: 2,
            }}
          >
            Total Lessons
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
