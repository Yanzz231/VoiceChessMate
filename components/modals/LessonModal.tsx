import React from "react";
import { Modal, TouchableOpacity, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LessonNode } from "@/types/lesson";

interface LessonModalProps {
  visible: boolean;
  lesson: LessonNode | null;
  onClose: () => void;
  onTextPress: (text: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  visible,
  lesson,
  onClose,
  onTextPress,
}) => {
  const router = useRouter();

  if (!lesson) return null;

  const handleStart = () => {
    onTextPress("Starting lesson");
    onClose();

    router.push({
      pathname: "/lesson-game/[courseId]",
      params: {
        courseId: lesson.courseId!,
        fen: lesson.fen || "",
        objective: lesson.objective || "",
        title: lesson.title,
        lessonId: lesson.sectionId || "",
      },
    });
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: WCAGColors.neutral.white,
            borderTopLeftRadius: AccessibilitySizes.radius.xl,
            borderTopRightRadius: AccessibilitySizes.radius.xl,
            padding: AccessibilitySizes.spacing.xl,
            paddingBottom: 40,
          }}
        >
          <TouchableOpacity
            onPress={() => onTextPress(lesson.type)}
            activeOpacity={0.8}
            style={{
              backgroundColor: WCAGColors.primary.yellowBg,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              alignSelf: "flex-start",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.primary.yellowDark,
                textTransform: "uppercase",
              }}
            >
              {lesson.type}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onTextPress(lesson.title)}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.xxl,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.gray900,
                marginBottom: 4,
              }}
            >
              {lesson.title}
            </Text>
            <Text
              style={{
                fontSize: AccessibilitySizes.text.md,
                color: WCAGColors.neutral.gray600,
                marginBottom: 16,
              }}
            >
              {lesson.subtitle}
            </Text>
          </TouchableOpacity>

          {lesson.objective && (
            <TouchableOpacity
              onPress={() => onTextPress(lesson.objective || "")}
              activeOpacity={0.8}
              style={{
                backgroundColor: WCAGColors.primary.yellowBg,
                padding: 16,
                borderRadius: AccessibilitySizes.radius.md,
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: WCAGColors.primary.yellow,
              }}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.sm,
                  color: WCAGColors.neutral.gray600,
                }}
              >
                Objective:
              </Text>
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  color: WCAGColors.neutral.gray900,
                  marginTop: 4,
                }}
              >
                {lesson.objective}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleStart}
            style={{
              backgroundColor: lesson.locked
                ? WCAGColors.neutral.gray300
                : WCAGColors.primary.yellow,
              paddingVertical: 16,
              borderRadius: AccessibilitySizes.radius.md,
              alignItems: "center",
              minHeight: AccessibilitySizes.minTouchTarget,
              justifyContent: "center",
            }}
            disabled={lesson.locked}
          >
            <Text
              style={{
                fontSize: AccessibilitySizes.text.lg,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: lesson.locked
                  ? WCAGColors.neutral.gray600
                  : WCAGColors.neutral.gray900,
              }}
            >
              {lesson.locked
                ? "Locked"
                : lesson.completed
                ? "Review"
                : "Start"}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
