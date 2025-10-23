import { HomeHeader } from "@/components/home/HomeHeader";
import { LessonPath } from "@/components/home/LessonPath";
import { TabBar } from "@/components/home/TabBar";
import { VoiceNavigationButton } from "@/components/home/VoiceNavigationButton";
import { ExitModal } from "@/components/modals/ExitModal";
import { LessonModal } from "@/components/modals/LessonModal";
import { LESSON_DATA } from "@/constants/lessonData";
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { WCAGColors } from "@/constants/wcagColors";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { LessonNode } from "@/types/lesson";
import { speak } from "@/utils/speechUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";

const { width } = Dimensions.get("window");

const generateLessonPath = (progress: Record<string, boolean>): LessonNode[] => {
  const nodes: LessonNode[] = [];
  const sections = Object.keys(LESSON_DATA);
  let currentY = 80;
  let nodeIndex = 0;

  sections.forEach((sectionId, sectionIndex) => {
    const section = LESSON_DATA[sectionId];

    nodes.push({
      id: `header_${sectionId}`,
      title: section.title,
      subtitle: section.subtitle,
      type: "section-header",
      locked: false,
      completed: false,
      stars: 0,
      progress: 0,
      x: width / 2,
      y: currentY,
      sectionId,
    });
    currentY += 100;

    section.courses.forEach((course, courseIndex) => {
      let xPosition;
      if (nodeIndex % 3 === 0) {
        xPosition = width / 2;
      } else if (nodeIndex % 3 === 1) {
        xPosition = width * 0.28;
      } else {
        xPosition = width * 0.72;
      }

      const courseProgressKey = `course_${course.id}_completed`;
      const isCompleted = progress[courseProgressKey] === true;
      const isFirstCourse = sectionIndex === 0 && courseIndex === 0;

      let isUnlocked = isFirstCourse;
      if (!isFirstCourse && nodeIndex > 0) {
        const previousCourseNode = nodes[nodes.length - 1];
        if (previousCourseNode.type === "lesson" && previousCourseNode.courseId) {
          const prevProgressKey = `course_${previousCourseNode.courseId}_completed`;
          isUnlocked = progress[prevProgressKey] === true;
        }
      }

      nodes.push({
        id: `course_${course.id}`,
        title: course.title,
        subtitle: course.description,
        type: "lesson",
        locked: !isUnlocked,
        completed: isCompleted,
        stars: isUnlocked && !isCompleted ? 3 : 0,
        progress: isCompleted ? 100 : 0,
        x: xPosition,
        y: currentY,
        sectionId,
        courseId: course.id,
        fen: course.fen,
        objective: course.objective,
        description: course.description,
      });

      currentY += 150;
      nodeIndex++;
    });

    currentY += 50;
  });

  return nodes;
};

const calculatePathHeight = (nodes: LessonNode[]): number => {
  if (nodes.length === 0) return 1120;
  const maxY = Math.max(...nodes.map((n) => n.y));
  return maxY + 200;
};

type TabType = "home" | "play" | "scan" | "analyze" | "settings";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonNode | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [userName, setUserName] = useState("User");
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [silentModeEnabled, setSilentModeEnabled] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [lessonPath, setLessonPath] = useState<LessonNode[]>([]);
  const [pathHeight, setPathHeight] = useState(1120);
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

  const { handleTouchStart, handleTouchEnd, isRecording } = useVoiceRecording({
    language: "en-US",
    onTranscriptComplete: async (result) => {
      if (result?.text) {
        await processVoiceCommand(result.text);
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

      const progress: Record<string, boolean> = {};

      for (const sectionId of Object.keys(LESSON_DATA)) {
        const section = LESSON_DATA[sectionId];
        for (const course of section.courses) {
          const courseProgressKey = `course_${course.id}_completed`;
          const completed = await AsyncStorage.getItem(courseProgressKey);
          progress[courseProgressKey] = completed === "true";
        }
      }

      setLessonProgress(progress);

      const path = generateLessonPath(progress);
      setLessonPath(path);

      const height = calculatePathHeight(path);
      setPathHeight(height);

      const completedLessons = Object.values(progress).filter(Boolean).length;
      setCompletedCount(completedLessons);

      if (homeVoice !== "true" && voiceMode === "true") {
        speak("Welcome to VoiceMate. Your learning path awaits.");
        await AsyncStorage.setItem("homeVoice", "true");
      }

      if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
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
    speak(`${lesson.title}. ${lesson.description}.`);
  };

  const handleTextPress = (text: string) => {
    speak(text);
  };

  const handleProfilePress = () => {
    if (voiceModeEnabled) {
      speak("Profile");
    }
    router.push("/profile");
  };

  const handleLongPress = () => {
    if (silentModeEnabled) {
      handleTouchStart();
    }
  };

  const handlePressOut = async () => {
    if (silentModeEnabled) {
      await handleTouchEnd();
    }
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

      const checkNewlyUnlockedLessons = async () => {
        const progress: Record<string, boolean> = {};

        for (const sectionId of Object.keys(LESSON_DATA)) {
          const section = LESSON_DATA[sectionId];
          for (const course of section.courses) {
            const courseProgressKey = `course_${course.id}_completed`;
            const completed = await AsyncStorage.getItem(courseProgressKey);
            progress[courseProgressKey] = completed === "true";
          }
        }

        const newPath = generateLessonPath(progress);
        const newlyUnlockedLesson = newPath.find((node) => {
          if (node.type === "lesson" && !node.locked) {
            const oldNode = lessonPath.find((old) => old.id === node.id);
            return oldNode && oldNode.locked && !node.locked;
          }
          return false;
        });

        if (newlyUnlockedLesson && voiceModeEnabled) {
          speak(`New lesson unlocked. ${newlyUnlockedLesson.title}.`);
        }

        setLessonProgress(progress);
        setLessonPath(newPath);
        setPathHeight(calculatePathHeight(newPath));

        const completedLessons = Object.values(progress).filter(Boolean).length;
        setCompletedCount(completedLessons);
      };

      checkNewlyUnlockedLessons();

      return () => backHandler.remove();
    }, [lessonPath, voiceModeEnabled])
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: WCAGColors.primary.yellowBg }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WCAGColors.primary.yellowBg}
      />

      <HomeHeader
        userName={userName}
        completedCount={completedCount}
        totalLessons={lessonPath.length}
        onTextPress={handleTextPress}
        onProfilePress={handleProfilePress}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LessonPath
          lessonPath={lessonPath}
          pathHeight={pathHeight}
          floatAnim={floatAnim}
          onLessonPress={handleLessonPress}
          onTextPress={handleTextPress}
        />
      </ScrollView>

      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />

      <LessonModal
        visible={showLessonModal}
        lesson={selectedLesson}
        onClose={() => setShowLessonModal(false)}
        onTextPress={handleTextPress}
      />

      <ExitModal
        visible={showExitModal}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />

      {silentModeEnabled && (
        <VoiceNavigationButton
          isRecording={isRecording}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
        />
      )}
    </SafeAreaView>
  );
}
