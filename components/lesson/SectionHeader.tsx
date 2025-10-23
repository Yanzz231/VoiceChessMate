import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LessonNode } from "@/types/lesson";

interface SectionHeaderProps {
  lesson: LessonNode;
  onPress: (text: string) => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  lesson,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(`${lesson.title}. ${lesson.subtitle}`)}
      activeOpacity={0.8}
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        top: lesson.y - 30,
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: WCAGColors.primary.yellow,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: AccessibilitySizes.text.lg,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.neutral.white,
            textAlign: "center",
          }}
        >
          {lesson.title}
        </Text>
        <Text
          style={{
            fontSize: AccessibilitySizes.text.sm,
            color: WCAGColors.neutral.white,
            textAlign: "center",
            marginTop: 4,
            opacity: 0.9,
          }}
        >
          {lesson.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
