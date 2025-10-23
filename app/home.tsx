import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Pressable,
  Alert,
} from "react-native";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Polygon,
} from "react-native-svg";
import { WCAGColors, AccessibilitySizes } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";
import { HomeIcon } from "@/components/icons/tabs/HomeIcon";
import { PlayIcon } from "@/components/icons/tabs/PlayIcon";
import { ScanIcon } from "@/components/icons/tabs/ScanIcon";
import { AnalyzeIcon } from "@/components/icons/tabs/AnalyzeIcon";
import { SettingsIcon } from "@/components/icons/tabs/SettingsIcon";
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { SparkleIcon, StarIcon, CircleIcon } from "@/components/decorative/SparkleIcon";
import { LESSON_DATA } from "@/constants/lessonData";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import * as Speech from "expo-speech";

const { width, height } = Dimensions.get("window");
const NODE_SIZE = 70;
const CARD_WIDTH = 170;

interface LessonNode {
  id: string;
  title: string;
  subtitle: string;
  type: "lesson";
  locked: boolean;
  completed: boolean;
  stars: number;
  progress: number;
  x: number;
  y: number;
}

// Generate 12 lesson sections from LESSON_DATA
const generateLessonPath = (): LessonNode[] => {
  const lessons: LessonNode[] = [];
  const sections = Object.keys(LESSON_DATA);

  sections.forEach((sectionId, index) => {
    const section = LESSON_DATA[sectionId];
    const yPosition = 120 + (index * 180);

    // Alternate x position (left, center, right pattern)
    let xPosition;
    if (index % 3 === 0) {
      xPosition = width / 2; // Center
    } else if (index % 3 === 1) {
      xPosition = width * 0.28; // Left
    } else {
      xPosition = width * 0.72; // Right
    }

    lessons.push({
      id: sectionId,
      title: section.title,
      subtitle: section.subtitle,
      type: "lesson",
      locked: index !== 0, // Only first lesson unlocked
      completed: false,
      stars: 0,
      progress: 0,
      x: xPosition,
      y: yPosition,
    });
  });

  return lessons;
};

const LESSON_PATH: LessonNode[] = generateLessonPath();

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

type TabType = "home" | "play" | "scan" | "analyze" | "settings";

const LessonNodeIcon = ({
  type,
  locked,
}: {
  type: string;
  locked: boolean;
}) => {
  const color = locked
    ? WCAGColors.neutral.gray500
    : WCAGColors.neutral.white;

  if (type === "lesson") {
    return (
      <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
        />
      </Svg>
    );
  }

  if (type === "practice") {
    return (
      <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 11L12 14L22 4"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 20V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (type === "test") {
    return (
      <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Path
          d="M12 6V12L16 14"
          stroke={
            locked
              ? WCAGColors.neutral.gray700
              : WCAGColors.primary.yellow
          }
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
};

const StarDisplay = ({ stars }: { stars: number }) => {
  return (
    <View style={{ flexDirection: "row", gap: 6, justifyContent: "center" }}>
      {[1, 2, 3].map((star) => (
        <Svg key={star} width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={
              star <= stars
                ? WCAGColors.primary.yellow
                : WCAGColors.neutral.gray300
            }
          />
        </Svg>
      ))}
    </View>
  );
};

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonNode | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [userName, setUserName] = useState("User");
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [silentModeEnabled, setSilentModeEnabled] = useState(false);
  const lastBackPress = useRef<number>(0);
  const floatAnim = useRef(new Animated.Value(0)).current;

  const { processVoiceCommand } = useVoiceNavigation({
    onNavigationStart: (screen) => {
      let navigationMessage = "";
      switch (screen) {
        case "play":
          navigationMessage = "Opening game";
          break;
        case "scan":
          navigationMessage = "Opening camera";
          break;
        case "lesson":
          navigationMessage = "Opening lessons";
          break;
        case "analyze":
          navigationMessage = "Opening analysis";
          break;
        case "setting":
          navigationMessage = "Opening settings";
          break;
        default:
          navigationMessage = "Starting navigation";
      }

      Speech.speak(navigationMessage, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    },
  });

  const { startLongPress, stopLongPress, isRecording } = useVoiceRecording({
    language: "en-US",
    onTranscriptComplete: async (result) => {
      if (result?.transcript) {
        await processVoiceCommand(result.transcript);
      }
    },
  });

  useEffect(() => {
    const initVoice = async () => {
      const homeVoice = await AsyncStorage.getItem("homeVoice");
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      const onboardingMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.ONBOARDING_MODE);

      setVoiceModeEnabled(voiceMode === "true");
      setSilentModeEnabled(onboardingMode === "silent");

      if (homeVoice === "false" && voiceMode === "true") {
        speak("Welcome to ChessMate. Your learning path awaits.");
        await AsyncStorage.setItem("homeVoice", "true");
      }

      const profileData = await AsyncStorage.getItem(USER_STORAGE_KEYS.PROFILE);
      if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }

      const completed = LESSON_PATH.filter((l) => l.completed).length;
      setCompletedCount(completed);
    };

    initVoice();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [user]);

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);

    if (voiceModeEnabled) {
      switch (tab) {
        case "home":
          speak("Home");
          break;
        case "play":
          speak("Play with AI");
          break;
        case "scan":
          speak("Scan");
          break;
        case "analyze":
          speak("Analyze");
          break;
        case "settings":
          speak("Settings");
          break;
      }
    }

    switch (tab) {
      case "play":
        router.push("/play");
        break;
      case "scan":
        router.push("/scan");
        break;
      case "analyze":
        router.push("/analyze");
        break;
      case "settings":
        router.push("/settings");
        break;
    }
  };

  const handleLessonPress = (lesson: LessonNode) => {
    if (lesson.locked) {
      if (voiceModeEnabled) {
        speak("Locked. Complete previous lessons first.");
      }
      return;
    }

    setSelectedLesson(lesson);
    setShowLessonModal(true);
    if (voiceModeEnabled) {
      speak(`${lesson.title}. ${lesson.description}.`);
    }
  };

  const handleStartLesson = () => {
    if (selectedLesson) {
      if (voiceModeEnabled) {
        speak("Starting lesson");
      }
      setShowLessonModal(false);
      router.push(`/lesson-detail/${selectedLesson.id}`);
    }
  };

  const handleTextPress = (text: string) => {
    if (voiceModeEnabled) {
      speak(text);
    }
  };

  const handleLongPress = async () => {
    if (silentModeEnabled) {
      await startLongPress();
      Speech.speak("Listening for command", {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const handlePressOut = async () => {
    if (silentModeEnabled && isRecording) {
      await stopLongPress();
    }
  };

  const getNodeBackgroundColor = (lesson: LessonNode) => {
    if (lesson.locked) return WCAGColors.neutral.gray300;
    if (lesson.completed) return WCAGColors.semantic.success;
    if (lesson.type === "bonus") return WCAGColors.primary.yellowDark;
    return WCAGColors.primary.yellow;
  };

  const backAction = () => {
    const currentTime = Date.now();

    if (currentTime - lastBackPress.current < 2000) {
      return true;
    }

    lastBackPress.current = currentTime;
    setShowExitModal(true);
    return true;
  };

  const confirmExit = () => {
    setShowExitModal(false);
    BackHandler.exitApp();
  };

  const cancelExit = () => {
    setShowExitModal(false);
    lastBackPress.current = 0;
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  const renderLessonModal = () => {
    if (!showLessonModal || !selectedLesson) return null;

    return (
      <Modal visible={showLessonModal} transparent={true} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: WCAGColors.neutral.white,
              borderTopLeftRadius: AccessibilitySizes.radius.xl,
              borderTopRightRadius: AccessibilitySizes.radius.xl,
              padding: AccessibilitySizes.spacing.xl,
              paddingBottom: 40,
            }}
          >
            {/* Type Badge */}
            <TouchableOpacity
              onPress={() => handleTextPress(selectedLesson.type)}
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
                {selectedLesson.type}
              </Text>
            </TouchableOpacity>

            {/* Title */}
            <TouchableOpacity
              onPress={() => handleTextPress(selectedLesson.title)}
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
                {selectedLesson.title}
              </Text>
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  color: WCAGColors.neutral.gray500,
                  marginBottom: 16,
                }}
              >
                {selectedLesson.subtitle}
              </Text>
            </TouchableOpacity>

            {/* Progress & Stars */}
            <View
              style={{
                backgroundColor: WCAGColors.neutral.gray50,
                borderRadius: AccessibilitySizes.radius.md,
                padding: AccessibilitySizes.spacing.md,
                marginBottom: 24,
              }}
            >
              <TouchableOpacity
                onPress={() => handleTextPress(`Progress: ${selectedLesson.progress} percent`)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: AccessibilitySizes.text.sm,
                    color: WCAGColors.neutral.gray600,
                  }}
                >
                  Progress
                </Text>
                <Text
                  style={{
                    fontSize: AccessibilitySizes.text.sm,
                    fontWeight: AccessibilitySizes.fontWeight.bold,
                    color: WCAGColors.primary.yellow,
                  }}
                >
                  {selectedLesson.progress}%
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  height: 8,
                  backgroundColor: WCAGColors.neutral.gray200,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${selectedLesson.progress}%`,
                    backgroundColor: WCAGColors.primary.yellow,
                  }}
                />
              </View>

              {selectedLesson.completed && (
                <View style={{ marginTop: 16, alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.sm,
                      color: WCAGColors.neutral.gray600,
                      marginBottom: 8,
                    }}
                  >
                    Your Stars
                  </Text>
                  <StarDisplay stars={selectedLesson.stars} />
                </View>
              )}
            </View>

            {/* Buttons */}
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleStartLesson}
                style={{
                  backgroundColor: WCAGColors.primary.yellow,
                  paddingVertical: 18,
                  borderRadius: AccessibilitySizes.radius.md,
                  minHeight: AccessibilitySizes.minTouchTarget,
                  justifyContent: "center",
                  shadowColor: WCAGColors.primary.yellow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Start lesson"
              >
                <Text
                  style={{
                    color: WCAGColors.neutral.gray900,
                    fontSize: AccessibilitySizes.text.lg,
                    fontWeight: AccessibilitySizes.fontWeight.bold,
                    textAlign: "center",
                  }}
                >
                  {selectedLesson.completed ? "Review Lesson" : "Start Lesson"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowLessonModal(false)}
                style={{
                  backgroundColor: WCAGColors.neutral.gray100,
                  paddingVertical: 18,
                  borderRadius: AccessibilitySizes.radius.md,
                  minHeight: AccessibilitySizes.minTouchTarget,
                  justifyContent: "center",
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text
                  style={{
                    color: WCAGColors.neutral.gray700,
                    fontSize: AccessibilitySizes.text.lg,
                    fontWeight: AccessibilitySizes.fontWeight.semibold,
                    textAlign: "center",
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderExitModal = () => {
    if (!showExitModal) return null;

    return (
      <Modal visible={showExitModal} transparent={true} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: WCAGColors.neutral.white,
              borderRadius: AccessibilitySizes.radius.lg,
              marginHorizontal: AccessibilitySizes.spacing.lg,
              maxWidth: 400,
              width: "90%",
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            {/* Yellow Header */}
            <View
              style={{
                backgroundColor: WCAGColors.primary.yellow,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                  <Path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    fill={WCAGColors.neutral.white}
                  />
                  <Path
                    d="M2 17L12 22L22 17"
                    stroke={WCAGColors.neutral.white}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M2 12L12 17L22 12"
                    stroke={WCAGColors.neutral.white}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  style={{
                    fontSize: AccessibilitySizes.text.md,
                    fontWeight: AccessibilitySizes.fontWeight.bold,
                    color: WCAGColors.neutral.white,
                  }}
                >
                  Are you sure you want to change this page?
                </Text>
              </View>
              <TouchableOpacity onPress={cancelExit}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6L18 18"
                    stroke={WCAGColors.neutral.white}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={{ padding: 24 }}>
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  color: WCAGColors.neutral.gray600,
                  marginBottom: 24,
                  lineHeight: 22,
                }}
              >
                Changes you made will not be saved
              </Text>

              <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
                <TouchableOpacity
                  onPress={cancelExit}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: AccessibilitySizes.radius.md,
                    minHeight: AccessibilitySizes.minTouchTarget,
                    justifyContent: "center",
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="NO"
                >
                  <Text
                    style={{
                      color: WCAGColors.primary.yellow,
                      fontSize: AccessibilitySizes.text.md,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                    }}
                  >
                    NO
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmExit}
                  style={{
                    backgroundColor: WCAGColors.primary.yellow,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: AccessibilitySizes.radius.md,
                    minHeight: AccessibilitySizes.minTouchTarget,
                    justifyContent: "center",
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="YES"
                >
                  <Text
                    style={{
                      color: WCAGColors.neutral.white,
                      fontSize: AccessibilitySizes.text.md,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                    }}
                  >
                    YES
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const curvedPath = createCurvedPath(LESSON_PATH);

  return (
    <Pressable
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      delayLongPress={3000}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: WCAGColors.primary.yellowBg }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={WCAGColors.primary.yellowBg}
        />

      {/* Header with Profile */}
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
        {/* Profile Row */}
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
            onPress={() => handleTextPress(`Hello, ${userName}`)}
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
            onPress={() => {
              if (voiceModeEnabled) {
                speak("Profile");
              }
              router.push("/profile");
            }}
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

        {/* Stats */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTextPress(`You have completed ${completedCount} out of ${LESSON_PATH.length} lessons`)}
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
              {LESSON_PATH.length}
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

      {/* Lesson Path */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ position: "relative", height: 1120, width: width }}>
          {/* Curved Path SVG */}
          <Svg
            height="1120"
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

          {/* Lesson Nodes */}
          {LESSON_PATH.map((lesson) => {
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
                {/* Decorative Icons for Unlocked Lesson */}
                {isUnlocked && (
                  <>
                    {/* Top Left Sparkle */}
                    <View style={{ position: "absolute", top: -12, left: -8 }}>
                      <SparkleIcon size={24} color={WCAGColors.primary.yellow} />
                    </View>

                    {/* Top Right Star */}
                    <View style={{ position: "absolute", top: -8, right: -10 }}>
                      <StarIcon size={20} color={WCAGColors.primary.yellowLight} />
                    </View>

                    {/* Bottom Left Circle */}
                    <View style={{ position: "absolute", bottom: 8, left: -14 }}>
                      <CircleIcon size={16} color={WCAGColors.primary.yellowLight} />
                    </View>

                    {/* Bottom Right Sparkle */}
                    <View style={{ position: "absolute", bottom: -6, right: -12 }}>
                      <SparkleIcon size={18} color={WCAGColors.primary.yellow} />
                    </View>
                  </>
                )}

                <TouchableOpacity
                  onPress={() => handleLessonPress(lesson)}
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
                  {/* Node Circle */}
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
                          fill={WCAGColors.neutral.gray500}
                          stroke={WCAGColors.neutral.gray500}
                          strokeWidth="2"
                        />
                        <Path
                          d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                          stroke={WCAGColors.neutral.gray500}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </Svg>
                    ) : (
                      <LessonNodeIcon type={lesson.type} locked={lesson.locked} />
                    )}
                  </View>

                  {/* Start Label for Unlocked Lesson */}
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
      </ScrollView>

      {/* Bottom Tab Bar */}
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
          {/* Home Tab */}
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
                  : WCAGColors.neutral.gray500
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
                    : WCAGColors.neutral.gray500,
                fontWeight:
                  activeTab === "home"
                    ? AccessibilitySizes.fontWeight.bold
                    : AccessibilitySizes.fontWeight.normal,
              }}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Play Tab */}
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
                  : WCAGColors.neutral.gray500
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
                    : WCAGColors.neutral.gray500,
                fontWeight:
                  activeTab === "play"
                    ? AccessibilitySizes.fontWeight.bold
                    : AccessibilitySizes.fontWeight.normal,
              }}
            >
              Play AI
            </Text>
          </TouchableOpacity>

          {/* Scan Tab - Center */}
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

          {/* Analyze Tab */}
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
                  : WCAGColors.neutral.gray500
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
                    : WCAGColors.neutral.gray500,
                fontWeight:
                  activeTab === "analyze"
                    ? AccessibilitySizes.fontWeight.bold
                    : AccessibilitySizes.fontWeight.normal,
              }}
            >
              Analyze
            </Text>
          </TouchableOpacity>

          {/* Settings Tab */}
          <TouchableOpacity
            onPress={() => handleTabPress("settings")}
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
                  : WCAGColors.neutral.gray500
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
                    : WCAGColors.neutral.gray500,
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

      {renderLessonModal()}
      {renderExitModal()}
    </SafeAreaView>
    </Pressable>
  );
}
