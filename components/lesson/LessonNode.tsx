import React from "react";
import { TouchableOpacity, View, Text, Animated } from "react-native";
import Svg, { Path } from "react-native-svg";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LessonNode as LessonNodeType } from "@/types/lesson";
import { LessonNodeIcon } from "./LessonNodeIcon";
import { SparkleIcon, StarIcon, CircleIcon } from "@/components/decorative/SparkleIcon";

const NODE_SIZE = 70;

interface LessonNodeProps {
  lesson: LessonNodeType;
  floatAnim: Animated.Value;
  onPress: (lesson: LessonNodeType) => void;
}

const getNodeBackgroundColor = (lesson: LessonNodeType) => {
  if (lesson.locked) return WCAGColors.neutral.gray300;
  if (lesson.completed) return WCAGColors.semantic.success;
  return WCAGColors.primary.yellow;
};

export const LessonNode: React.FC<LessonNodeProps> = ({
  lesson,
  floatAnim,
  onPress,
}) => {
  const isUnlocked = !lesson.locked;
  const NodeContainer = isUnlocked ? Animated.View : View;

  return (
    <NodeContainer
      style={{
        position: "absolute",
        left: lesson.x - NODE_SIZE / 2,
        top: lesson.y - NODE_SIZE / 2,
        alignItems: "center",
        transform: isUnlocked ? [{ translateY: floatAnim }] : undefined,
      }}
    >
      {isUnlocked && (
        <>
          <View style={{ position: "absolute", top: -12, left: -8 }}>
            <SparkleIcon size={24} color={WCAGColors.primary.yellow} />
          </View>

          <View style={{ position: "absolute", top: -8, right: -10 }}>
            <StarIcon size={20} color={WCAGColors.primary.yellowLight} />
          </View>

          <View style={{ position: "absolute", bottom: 8, left: -14 }}>
            <CircleIcon size={16} color={WCAGColors.primary.yellowLight} />
          </View>

          <View style={{ position: "absolute", bottom: -6, right: -12 }}>
            <SparkleIcon size={18} color={WCAGColors.primary.yellow} />
          </View>
        </>
      )}

      <TouchableOpacity
        onPress={() => onPress(lesson)}
        activeOpacity={lesson.locked ? 1 : 0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${lesson.title}. ${
          lesson.locked ? "Locked" : lesson.completed ? "Completed" : "Available"
        }`}
        style={{ alignItems: "center" }}
      >
        <View
          style={{
            width: NODE_SIZE,
            height: NODE_SIZE,
            borderRadius: NODE_SIZE / 2,
            backgroundColor: getNodeBackgroundColor(lesson),
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: lesson.locked ? 2 : 8 },
            shadowOpacity: lesson.locked ? 0.12 : 0.35,
            shadowRadius: lesson.locked ? 4 : 12,
            elevation: lesson.locked ? 2 : 10,
            borderWidth: 5,
            borderColor: WCAGColors.neutral.white,
          }}
        >
          {lesson.locked ? (
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                fill={WCAGColors.neutral.gray600}
                stroke={WCAGColors.neutral.gray600}
                strokeWidth="2"
              />
              <Path
                d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                stroke={WCAGColors.neutral.gray600}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
          ) : (
            <LessonNodeIcon type={lesson.type} locked={lesson.locked} />
          )}
        </View>

        {isUnlocked && !lesson.completed && (
          <View
            style={{
              backgroundColor: WCAGColors.primary.yellow,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: AccessibilitySizes.fontWeight.bold,
                color: WCAGColors.neutral.white,
                textTransform: "uppercase",
              }}
            >
              START
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </NodeContainer>
  );
};
