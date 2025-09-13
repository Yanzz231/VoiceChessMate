import { PieceRenderer } from "@/components/chess/PieceRenderer";
import {
  DEFAULT_PIECE_THEME,
  PIECE_THEMES,
  PieceTheme,
} from "@/constants/chessPieceThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LessonData {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  pieceType?: "p" | "r" | "n" | "b" | "q" | "k";
  pieceColor?: "w" | "b";
  iconName?: string;
}

interface Section {
  title: string;
  expanded: boolean;
  lessons: LessonData[];
}

export default function LessonsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPieceTheme, setCurrentPieceTheme] =
    useState<PieceTheme>(DEFAULT_PIECE_THEME);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      title: "Chess Basics",
      expanded: true,
      lessons: [
        {
          id: "1",
          title: "Rook",
          subtitle: "How castle towers move",
          progress: 0,
          pieceType: "r",
          pieceColor: "b",
        },
        {
          id: "2",
          title: "Bishop",
          subtitle: "How bishops move",
          progress: 0,
          pieceType: "b",
          pieceColor: "b",
        },
        {
          id: "3",
          title: "Queen",
          subtitle: "How queens move",
          progress: 0,
          pieceType: "q",
          pieceColor: "b",
        },
        {
          id: "4",
          title: "King",
          subtitle: "How kings move",
          progress: 0,
          pieceType: "k",
          pieceColor: "b",
        },
        {
          id: "5",
          title: "Knight",
          subtitle: "How horses move",
          progress: 0,
          pieceType: "n",
          pieceColor: "b",
        },
        {
          id: "6",
          title: "Pawn",
          subtitle: "How pawns move",
          progress: 0,
          pieceType: "p",
          pieceColor: "b",
        },
      ],
    },
    {
      title: "Fundamentals",
      expanded: true,
      lessons: [
        {
          id: "7",
          title: "Capture",
          subtitle: "Take enemy pieces",
          progress: 0,
          iconName: "flash",
        },
        {
          id: "8",
          title: "Protection",
          subtitle: "Keep your pieces safe",
          progress: 0,
          iconName: "shield",
        },
        {
          id: "9",
          title: "Combat",
          subtitle: "Attack and defend",
          progress: 0,
          iconName: "flame",
        },
        {
          id: "10",
          title: "Check Pt 1",
          subtitle: "Threaten the king",
          progress: 0,
          iconName: "warning",
        },
        {
          id: "11",
          title: "Stalemate",
          subtitle: "When no moves are legal",
          progress: 0,
          iconName: "lock-closed",
        },
        {
          id: "12",
          title: "Out of Check",
          subtitle: "Escape from check",
          progress: 0,
          iconName: "exit",
        },
      ],
    },
  ]);

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

  const handleTranscriptComplete = useCallback(
    async (result: any) => {
      if (result?.text) {
        const transcriptText = result.text.trim();

        Speech.speak("Command received", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });

        await processVoiceCommand(transcriptText);
      } else {
        Speech.speak("Command not understood", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      }
    },
    [processVoiceCommand]
  );

  const { handleTouchStart, handleTouchEnd, cleanup } = useVoiceRecording({
    apiKey: "37c72e8e5dd344939db0183d6509ceec",
    language: "id",
    longPressThreshold: 1000,
    onTranscriptComplete: handleTranscriptComplete,
  });

  const loadPieceTheme = async () => {
    try {
      const savedPieceThemeId = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.PIECE_THEME
      );
      if (savedPieceThemeId) {
        const pieceTheme =
          PIECE_THEMES.find((t) => t.id === savedPieceThemeId) ||
          DEFAULT_PIECE_THEME;
        setCurrentPieceTheme(pieceTheme);
      }
    } catch (error) {}
  };

  const loadLessonProgress = async () => {
    try {
      const updatedSections = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          lessons: await Promise.all(
            section.lessons.map(async (lesson) => {
              let completedCourses = 0;
              for (let i = 1; i <= 5; i++) {
                const courseKey = `course_${lesson.title.toLowerCase()}_${i}_completed`;
                const completed = await AsyncStorage.getItem(courseKey);
                if (completed === "true") {
                  completedCourses++;
                }
              }
              const progress = Math.round((completedCourses / 5) * 100);
              return { ...lesson, progress };
            })
          ),
        }))
      );
      setSections(updatedSections);
    } catch (error) {
      throw error;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadPieceTheme(), loadLessonProgress()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [sections]);

  useEffect(() => {
    loadPieceTheme();
  }, []);

  useEffect(() => {
    loadLessonProgress();
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const toggleSection = (sectionTitle: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.title === sectionTitle
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const getFilteredSections = () => {
    if (searchQuery.trim() === "") {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        lessons: section.lessons.filter(
          (lesson) =>
            lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lesson.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.lessons.length > 0);
  };

  const renderLessonIcon = (lesson: LessonData) => {
    if (lesson.pieceType && lesson.pieceColor) {
      return (
        <PieceRenderer
          type={lesson.pieceType}
          color={lesson.pieceColor}
          theme={currentPieceTheme.version}
          size={50}
        />
      );
    } else if (lesson.iconName) {
      return (
        <Ionicons name={lesson.iconName as any} size={28} color="#374151" />
      );
    }
    return null;
  };

  const handleLessonPress = (lesson: LessonData) => {
    router.push({
      pathname: "/lesson-detail/[lessonId]",
      params: { lessonId: lesson.id },
    });
  };

  const renderLessonGrid = (lessons: LessonData[]) => {
    const rows = [];
    for (let i = 0; i < lessons.length; i += 2) {
      const leftLesson = lessons[i];
      const rightLesson = lessons[i + 1];

      rows.push(
        <View key={`row-${i}`} className="flex-row gap-3 mb-3">
          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              minHeight: 120,
            }}
            activeOpacity={0.7}
            onPress={() => handleLessonPress(leftLesson)}
          >
            <View className="mb-3 h-8 w-8">{renderLessonIcon(leftLesson)}</View>
            <Text className="font-semibold text-sm text-gray-900 mb-1 leading-tight">
              {leftLesson.title}
            </Text>
            <Text className="text-xs text-gray-600 mb-3 leading-tight">
              {leftLesson.subtitle}
            </Text>

            <View className="mt-auto">
              <View className="h-1 bg-gray-200 rounded-full mb-1">
                <View
                  className="h-1 rounded-full"
                  style={{
                    width: `${leftLesson.progress}%`,
                    backgroundColor: "#374151",
                  }}
                />
              </View>
              <Text className="text-xs text-gray-600 text-right">
                {leftLesson.progress}%
              </Text>
            </View>
          </TouchableOpacity>

          {rightLesson ? (
            <TouchableOpacity
              className="flex-1 bg-white rounded-xl p-4 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                minHeight: 120,
              }}
              activeOpacity={0.7}
              onPress={() => handleLessonPress(rightLesson)}
            >
              <View className="mb-3 h-8 w-8">
                {renderLessonIcon(rightLesson)}
              </View>
              <Text className="font-semibold text-sm text-gray-900 mb-1 leading-tight">
                {rightLesson.title}
              </Text>
              <Text className="text-xs text-gray-600 mb-3 leading-tight">
                {rightLesson.subtitle}
              </Text>

              <View className="mt-auto">
                <View className="h-1 bg-gray-200 rounded-full mb-1">
                  <View
                    className="h-1 rounded-full"
                    style={{
                      width: `${rightLesson.progress}%`,
                      backgroundColor: "#374151",
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-600 text-right">
                  {rightLesson.progress}%
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="flex-1" />
          )}
        </View>
      );
    }
    return rows;
  };

  const displaySections = getFilteredSections();

  return (
    <View
      className="flex-1 bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <StatusBar style="dark" />

      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-1"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 flex-1">
            Lessons
          </Text>

          <TouchableOpacity
            onPress={onRefresh}
            className="p-1 ml-2"
            activeOpacity={0.7}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={refreshing ? "#9CA3AF" : "#374151"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View className="px-4 py-4 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 gap-3">
          <TextInput
            placeholder="What do you want to learn today?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-base text-gray-900"
            placeholderTextColor="#6B7280"
          />
          <Ionicons name="search" size={18} color="#6B7280" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#374151"]}
            tintColor="#374151"
            title={refreshing ? "Updating lessons..." : "Pull to refresh"}
            titleColor="#6B7280"
          />
        }
      >
        {searchQuery.trim() !== "" && displaySections.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="search" size={48} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-500 mt-4">
              No lessons found
            </Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          displaySections.map((section) => (
            <View key={section.title} className="mb-6">
              <TouchableOpacity
                onPress={() => toggleSection(section.title)}
                className="flex-row items-center justify-between py-3"
                activeOpacity={0.7}
              >
                <Text className="text-lg font-bold text-gray-900">
                  {section.title}
                </Text>
                <Ionicons
                  name={section.expanded ? "chevron-down" : "chevron-forward"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {section.expanded && (
                <View className="mt-2">
                  {renderLessonGrid(section.lessons)}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
