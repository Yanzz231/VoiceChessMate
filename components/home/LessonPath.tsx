import React from "react";
import { View, Dimensions, TouchableOpacity, Text, Animated } from "react-native";
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { LessonNode } from "@/types/lesson";
import { LessonNodeIcon } from "./LessonNodeIcon";
import { SparkleIcon, StarIcon, CircleIcon } from "@/components/decorative/SparkleIcon";

const { width } = Dimensions.get("window");
const NODE_SIZE = 70;

interface LessonPathProps {
  lessonPath: LessonNode[];
  pathHeight: number;
  floatAnim: Animated.Value;
  onLessonPress: (lesson: LessonNode) => void;
  onTextPress: (text: string) => void;
}

const createCurvedPath = (nodes: LessonNode[]) => {
  if (nodes.length < 2) return "";

  let pathData = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let i = 0; i < nodes.length - 1; i++) {
    const current = nodes[i];
    const next = nodes[i + 1];

    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    pathData += ` Q ${current.x} ${midY}, ${midX} ${midY}`;
    pathData += ` Q ${next.x} ${midY}, ${next.x} ${next.y}`;
  }

  return pathData;
};

const getNodeBackgroundColor = (lesson: LessonNode) => {
  if (lesson.locked) return WCAGColors.neutral.gray300;
  if (lesson.completed) return WCAGColors.semantic.success;
  return WCAGColors.primary.yellow;
};

export const LessonPath: React.FC<LessonPathProps> = ({
  lessonPath,
  pathHeight,
  floatAnim,
  onLessonPress,
  onTextPress,
}) => {
  const curvedPath = createCurvedPath(lessonPath);

  return (
    <View style={{ position: "relative", height: pathHeight, width: width }}>
      <Svg
        height={pathHeight}
        width={width}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Defs>
          <SvgLinearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0"
              stopColor={WCAGColors.primary.yellow}
              stopOpacity="0.5"
            />
            <Stop
              offset="1"
              stopColor={WCAGColors.primary.yellow}
              stopOpacity="0.15"
            />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={curvedPath}
          stroke="url(#pathGrad)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>

      {lessonPath.map((lesson) => {
        if (lesson.type === "section-header") {
          return (
            <TouchableOpacity
              key={lesson.id}
              onPress={() => onTextPress(`${lesson.title}. ${lesson.subtitle}`)}
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
        }

        const isUnlocked = !lesson.locked;
        const NodeContainer = isUnlocked ? Animated.View : View;

        return (
          <NodeContainer
            key={lesson.id}
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
              onPress={() => onLessonPress(lesson)}
              activeOpacity={lesson.locked ? 1 : 0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${lesson.title}. ${
                lesson.locked
                  ? "Locked"
                  : lesson.completed
                  ? "Completed"
                  : "Available"
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
                <LessonNodeIcon type={lesson.type} locked={lesson.locked} />
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
      })}
    </View>
  );
};
