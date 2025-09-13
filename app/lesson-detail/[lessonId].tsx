import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Course {
  id: string;
  title: string;
  description: string;
  fen: string;
  objective: string;
  completed: boolean;
}

interface LessonData {
  title: string;
  subtitle: string;
  courses: Course[];
}

const LESSON_DATA: Record<string, LessonData> = {
  "1": {
    title: "Rook",
    subtitle: "How castle towers move",
    courses: [
      {
        id: "rook_1",
        title: "Basic Rook Movement",
        description: "Learn how the rook moves in straight lines",
        fen: "4k3/8/8/8/3R4/8/8/4K3 w - - 0 1",
        objective: "Move the rook to different squares",
        completed: false,
      },
      {
        id: "rook_2",
        title: "Rook Captures",
        description: "Practice capturing enemy pieces with your rook",
        fen: "r3k3/8/8/8/3R4/8/8/4K3 w - - 0 1",
        objective: "Capture the black rook on a8",
        completed: false,
      },
      {
        id: "rook_3",
        title: "Rook Defense",
        description: "Use your rook to defend important squares",
        fen: "4k3/8/8/8/3R4/8/3K4/8 w - - 0 1",
        objective: "Defend your king using the rook",
        completed: false,
      },
      {
        id: "rook_4",
        title: "Rook Endgame",
        description: "Master basic rook endgame techniques",
        fen: "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
        objective: "Checkmate the black king with rook and king",
        completed: false,
      },
      {
        id: "rook_5",
        title: "Double Rooks",
        description: "Coordinate two rooks for maximum power",
        fen: "4k3/8/8/8/3RR3/8/8/4K3 w - - 0 1",
        objective: "Use both rooks to control the center",
        completed: false,
      },
    ],
  },
  "2": {
    title: "Bishop",
    subtitle: "How bishops move",
    courses: [
      {
        id: "bishop_1",
        title: "Diagonal Movement",
        description: "Learn how bishops move diagonally",
        fen: "4k3/8/8/8/3B4/8/8/4K3 w - - 0 1",
        objective: "Move the bishop to attack multiple squares",
        completed: false,
      },
      {
        id: "bishop_2",
        title: "Bishop Captures",
        description: "Practice capturing with your bishop",
        fen: "b3k3/8/8/8/3B4/8/8/4K3 w - - 0 1",
        objective: "Capture the black bishop on a8",
        completed: false,
      },
      {
        id: "bishop_3",
        title: "Bishop Pair",
        description: "Learn the power of two bishops",
        fen: "4k3/8/8/8/2B1B3/8/8/4K3 w - - 0 1",
        objective: "Control long diagonals with both bishops",
        completed: false,
      },
      {
        id: "bishop_4",
        title: "Bishop vs Knight",
        description: "Understand bishop advantages in open positions",
        fen: "4k3/8/8/3n4/3B4/8/8/4K3 w - - 0 1",
        objective: "Outmaneuver the knight with your bishop",
        completed: false,
      },
      {
        id: "bishop_5",
        title: "Bishop Endgame",
        description: "Master basic bishop endgame principles",
        fen: "4k3/8/8/8/8/8/8/3BK3 w - - 0 1",
        objective: "Support your king with the bishop",
        completed: false,
      },
    ],
  },
  "3": {
    title: "Queen",
    subtitle: "How queens move",
    courses: [
      {
        id: "queen_1",
        title: "Queen Power",
        description: "Learn the queen's unlimited movement",
        fen: "4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1",
        objective: "Show the queen's range of movement",
        completed: false,
      },
      {
        id: "queen_2",
        title: "Queen Captures",
        description: "Practice capturing multiple pieces",
        fen: "r3k2r/8/8/8/3Q4/8/8/4K3 w - - 0 1",
        objective: "Capture both black rooks with the queen",
        completed: false,
      },
      {
        id: "queen_3",
        title: "Queen Safety",
        description: "Keep your queen safe from attacks",
        fen: "4k3/8/8/3n4/3Q4/8/8/4K3 w - - 0 1",
        objective: "Move the queen away from the knight's attack",
        completed: false,
      },
      {
        id: "queen_4",
        title: "Queen Checkmate",
        description: "Deliver checkmate with your queen",
        fen: "8/8/8/8/8/3k4/8/3QK3 w - - 0 1",
        objective: "Checkmate the black king with queen support",
        completed: false,
      },
      {
        id: "queen_5",
        title: "Queen Sacrifice",
        description: "Learn when to sacrifice the queen",
        fen: "4k3/8/8/8/3Q4/8/3K4/8 w - - 0 1",
        objective: "Find the winning queen sacrifice",
        completed: false,
      },
    ],
  },
  "4": {
    title: "King",
    subtitle: "How kings move",
    courses: [
      {
        id: "king_1",
        title: "King Movement",
        description: "Learn the king's limited but important moves",
        fen: "4k3/8/8/8/3K4/8/8/8 w - - 0 1",
        objective: "Move the king to safety",
        completed: false,
      },
      {
        id: "king_2",
        title: "King Safety",
        description: "Keep your king protected",
        fen: "4k3/8/8/3r4/3K4/8/8/8 w - - 0 1",
        objective: "Move the king away from the rook's attack",
        completed: false,
      },
      {
        id: "king_3",
        title: "Castling",
        description: "Learn the special castling move",
        fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
        objective: "Castle your king to safety",
        completed: false,
      },
      {
        id: "king_4",
        title: "King Activity",
        description: "Use your king actively in the endgame",
        fen: "8/8/8/8/8/3k4/8/3K4 w - - 0 1",
        objective: "Activate your king in the center",
        completed: false,
      },
      {
        id: "king_5",
        title: "King and Pawn",
        description: "Support your pawns with the king",
        fen: "8/8/8/8/3P4/3k4/8/3K4 w - - 0 1",
        objective: "Help the pawn promote with king support",
        completed: false,
      },
    ],
  },
  "5": {
    title: "Knight",
    subtitle: "How horses move",
    courses: [
      {
        id: "knight_1",
        title: "Knight Movement",
        description: "Learn the L-shaped knight move",
        fen: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
        objective: "Practice the knight's unique movement pattern",
        completed: false,
      },
      {
        id: "knight_2",
        title: "Knight Fork",
        description: "Attack two pieces at once",
        fen: "r3k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
        objective: "Fork the king and rook with your knight",
        completed: false,
      },
      {
        id: "knight_3",
        title: "Knight Outpost",
        description: "Place your knight on a strong square",
        fen: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
        objective: "Find the best outpost for your knight",
        completed: false,
      },
      {
        id: "knight_4",
        title: "Knight vs Bishop",
        description: "Use knight advantages in closed positions",
        fen: "4k3/8/8/3b4/3N4/8/8/4K3 w - - 0 1",
        objective: "Outmaneuver the bishop with your knight",
        completed: false,
      },
      {
        id: "knight_5",
        title: "Knight Endgame",
        description: "Master knight endgame techniques",
        fen: "8/8/8/8/8/3k4/8/3NK3 w - - 0 1",
        objective: "Support your king with the knight",
        completed: false,
      },
    ],
  },
  "6": {
    title: "Pawn",
    subtitle: "How pawns move",
    courses: [
      {
        id: "pawn_1",
        title: "Pawn Movement",
        description: "Learn how pawns move and capture",
        fen: "4k3/8/8/8/3P4/8/8/4K3 w - - 0 1",
        objective: "Advance your pawn forward",
        completed: false,
      },
      {
        id: "pawn_2",
        title: "Pawn Captures",
        description: "Practice capturing with pawns",
        fen: "4k3/8/8/2p1p3/3P4/8/8/4K3 w - - 0 1",
        objective: "Capture one of the black pawns",
        completed: false,
      },
      {
        id: "pawn_3",
        title: "Pawn Promotion",
        description: "Transform your pawn into a queen",
        fen: "4k3/3P4/8/8/8/8/8/4K3 w - - 0 1",
        objective: "Promote your pawn to a queen",
        completed: false,
      },
      {
        id: "pawn_4",
        title: "En Passant",
        description: "Learn the special en passant capture",
        fen: "4k3/8/8/3Pp3/8/8/8/4K3 w - e6 0 1",
        objective: "Capture the pawn using en passant",
        completed: false,
      },
      {
        id: "pawn_5",
        title: "Pawn Structure",
        description: "Understand good and bad pawn structures",
        fen: "4k3/8/8/8/2PPP3/8/8/4K3 w - - 0 1",
        objective: "Create a strong pawn chain",
        completed: false,
      },
    ],
  },
  "7": {
    title: "Capture",
    subtitle: "Take enemy pieces",
    courses: [
      {
        id: "capture_1",
        title: "Basic Captures",
        description: "Learn to capture enemy pieces",
        fen: "r3k3/8/8/8/3R4/8/8/4K3 w - - 0 1",
        objective: "Capture the black rook",
        completed: false,
      },
      {
        id: "capture_2",
        title: "Capture Value",
        description: "Understand piece values when capturing",
        fen: "3qk3/8/8/8/3R4/8/8/4K3 w - - 0 1",
        objective: "Decide whether to capture the queen",
        completed: false,
      },
      {
        id: "capture_3",
        title: "Recapture",
        description: "Handle recaptures correctly",
        fen: "3rk3/8/8/8/3R4/8/8/3RK3 w - - 0 1",
        objective: "Capture and then recapture properly",
        completed: false,
      },
      {
        id: "capture_4",
        title: "Capturing Chains",
        description: "Work through multiple captures",
        fen: "3rkb2/8/8/8/3R4/8/8/4K3 w - - 0 1",
        objective: "Calculate the best sequence of captures",
        completed: false,
      },
      {
        id: "capture_5",
        title: "Avoiding Captures",
        description: "Protect your pieces from captures",
        fen: "3rk3/8/8/8/3R4/8/8/3K4 w - - 0 1",
        objective: "Save your rook from being captured",
        completed: false,
      },
    ],
  },
  "8": {
    title: "Protection",
    subtitle: "Keep your pieces safe",
    courses: [
      {
        id: "protection_1",
        title: "Defending Pieces",
        description: "Learn to defend your pieces",
        fen: "3rk3/8/8/8/3R4/8/8/3RK3 w - - 0 1",
        objective: "Defend your attacked rook",
        completed: false,
      },
      {
        id: "protection_2",
        title: "Multiple Defenders",
        description: "Use multiple pieces for protection",
        fen: "3qk3/8/8/8/3R4/8/8/3RK3 w - - 0 1",
        objective: "Protect your rook with multiple pieces",
        completed: false,
      },
      {
        id: "protection_3",
        title: "King Safety",
        description: "Keep your king protected",
        fen: "r3k3/8/8/8/8/8/8/4K3 w - - 0 1",
        objective: "Move your king to safety",
        completed: false,
      },
      {
        id: "protection_4",
        title: "Overprotection",
        description: "Sometimes more defense is better",
        fen: "3qk3/8/8/8/3R4/8/3R4/3RK3 w - - 0 1",
        objective: "Overprotect your central rook",
        completed: false,
      },
      {
        id: "protection_5",
        title: "Mutual Protection",
        description: "Pieces protecting each other",
        fen: "4k3/8/8/8/3RR3/8/8/4K3 w - - 0 1",
        objective: "Set up mutual protection between rooks",
        completed: false,
      },
    ],
  },
  "9": {
    title: "Combat",
    subtitle: "Attack and defend",
    courses: [
      {
        id: "combat_1",
        title: "Simple Attacks",
        description: "Launch basic attacks on enemy pieces",
        fen: "3rk3/8/8/8/8/8/8/3RK3 w - - 0 1",
        objective: "Attack the black rook",
        completed: false,
      },
      {
        id: "combat_2",
        title: "Double Attack",
        description: "Attack two targets at once",
        fen: "r3k2r/8/8/8/8/8/8/3QK3 w - - 0 1",
        objective: "Attack both rooks simultaneously",
        completed: false,
      },
      {
        id: "combat_3",
        title: "Counter Attack",
        description: "Respond to attacks with your own",
        fen: "3rk3/8/8/8/8/8/3R4/3K4 w - - 0 1",
        objective: "Counter-attack when attacked",
        completed: false,
      },
      {
        id: "combat_4",
        title: "Tactical Combat",
        description: "Use tactics in your attacks",
        fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
        objective: "Find the tactical blow",
        completed: false,
      },
      {
        id: "combat_5",
        title: "Combat Endgame",
        description: "Fighting in the endgame",
        fen: "8/8/8/8/3k4/8/3R4/3K4 w - - 0 1",
        objective: "Win the endgame battle",
        completed: false,
      },
    ],
  },
  "10": {
    title: "Check Pt 1",
    subtitle: "Threaten the king",
    courses: [
      {
        id: "check_1",
        title: "What is Check",
        description: "Learn when the king is in check",
        fen: "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
        objective: "Put the black king in check",
        completed: false,
      },
      {
        id: "check_2",
        title: "Escaping Check",
        description: "Learn the three ways to escape check",
        fen: "4k3/8/8/8/8/8/3R4/3K4 b - - 0 1",
        objective: "Escape from check",
        completed: false,
      },
      {
        id: "check_3",
        title: "Double Check",
        description: "Attack the king with two pieces",
        fen: "4k3/8/8/8/8/8/8/R2QK3 w - - 0 1",
        objective: "Give double check to the black king",
        completed: false,
      },
      {
        id: "check_4",
        title: "Discovered Check",
        description: "Uncover a check by moving another piece",
        fen: "4k3/8/8/8/3B4/8/8/3RK3 w - - 0 1",
        objective: "Give discovered check",
        completed: false,
      },
      {
        id: "check_5",
        title: "Perpetual Check",
        description: "Force a draw with continuous checks",
        fen: "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
        objective: "Force perpetual check for a draw",
        completed: false,
      },
    ],
  },
  "11": {
    title: "Stalemate",
    subtitle: "When no moves are legal",
    courses: [
      {
        id: "stalemate_1",
        title: "What is Stalemate",
        description: "Understand when stalemate occurs",
        fen: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
        objective: "Recognize the stalemate position",
        completed: false,
      },
      {
        id: "stalemate_2",
        title: "Avoiding Stalemate",
        description: "Win without stalemating the opponent",
        fen: "7k/6Q1/6K1/8/8/8/8/8 w - - 0 1",
        objective: "Checkmate without stalemate",
        completed: false,
      },
      {
        id: "stalemate_3",
        title: "Stalemate Defense",
        description: "Use stalemate to save a lost position",
        fen: "7k/8/8/8/8/8/8/7K b - - 0 1",
        objective: "Force stalemate to draw",
        completed: false,
      },
      {
        id: "stalemate_4",
        title: "Stalemate Tricks",
        description: "Common stalemate patterns",
        fen: "8/8/8/8/8/5k2/8/5K1Q w - - 0 1",
        objective: "Avoid the stalemate trap",
        completed: false,
      },
      {
        id: "stalemate_5",
        title: "Complex Stalemate",
        description: "Advanced stalemate concepts",
        fen: "8/8/8/8/8/2k5/8/2K1Q3 w - - 0 1",
        objective: "Navigate complex stalemate issues",
        completed: false,
      },
    ],
  },
  "12": {
    title: "Out of Check",
    subtitle: "Escape from check",
    courses: [
      {
        id: "escape_1",
        title: "King Moves",
        description: "Escape check by moving the king",
        fen: "4k3/8/8/8/8/8/3R4/3K4 b - - 0 1",
        objective: "Move your king out of check",
        completed: false,
      },
      {
        id: "escape_2",
        title: "Block the Check",
        description: "Block the attacking piece",
        fen: "4k3/8/8/8/8/4r3/8/3RK3 b - - 0 1",
        objective: "Block the check with your rook",
        completed: false,
      },
      {
        id: "escape_3",
        title: "Capture the Attacker",
        description: "Capture the piece giving check",
        fen: "4k3/8/8/8/8/8/3r4/3RK3 b - - 0 1",
        objective: "Capture the checking piece",
        completed: false,
      },
      {
        id: "escape_4",
        title: "Multiple Options",
        description: "Choose the best way to escape check",
        fen: "4k3/4r3/8/8/8/8/8/3RK3 b - - 0 1",
        objective: "Find the best escape from check",
        completed: false,
      },
      {
        id: "escape_5",
        title: "Forced Moves",
        description: "Deal with situations where only one escape exists",
        fen: "5k2/8/8/8/8/8/8/3RK2Q b - - 0 1",
        objective: "Find the only legal move",
        completed: false,
      },
    ],
  },
};

export default function LessonDetailScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadLessonData = useCallback(async () => {
    if (!lessonId || !LESSON_DATA[lessonId]) return;

    const lesson = LESSON_DATA[lessonId];
    setLessonData(lesson);

    const coursesWithCompletion = await Promise.all(
      lesson.courses.map(async (course) => {
        try {
          const completed = await AsyncStorage.getItem(
            `course_${course.id}_completed`
          );
          return { ...course, completed: completed === "true" };
        } catch {
          return { ...course, completed: false };
        }
      })
    );

    setCourses(coursesWithCompletion);
  }, [lessonId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadLessonData();
    } catch (error) {
      console.error("Error refreshing lesson data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadLessonData]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  const handleCourseSelect = (course: Course) => {
    router.push({
      pathname: "/lesson-game/[courseId]",
      params: {
        courseId: course.id,
        fen: course.fen,
        objective: course.objective,
        title: course.title,
        lessonId: lessonId || "",
      },
    });
  };

  const calculateProgress = () => {
    const completedCount = courses.filter((course) => course.completed).length;
    return courses.length > 0
      ? Math.round((completedCount / courses.length) * 100)
      : 0;
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-4 mb-3 p-4 shadow-sm border border-gray-100"
      onPress={() => handleCourseSelect(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                item.completed ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Ionicons
                name={item.completed ? "checkmark" : "play"}
                size={16}
                color={item.completed ? "#22C55E" : "#374151"}
              />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              {item.title}
            </Text>
          </View>

          <Text className="text-sm text-gray-600 mb-2">{item.description}</Text>

          <Text className="text-xs text-gray-500">
            Objective: {item.objective}
          </Text>
        </View>

        <View className="items-center">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              item.completed ? "bg-green-600" : "bg-gray-900"
            }`}
          >
            <Ionicons
              name={item.completed ? "checkmark-circle" : "play-circle"}
              size={24}
              color="white"
            />
          </View>
          <Text
            className={`text-xs mt-1 font-medium ${
              item.completed ? "text-green-600" : "text-gray-600"
            }`}
          >
            {item.completed ? "Done" : "Start"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!lessonData) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Loading lesson...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
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
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              {lessonData.title}
            </Text>
            <Text className="text-sm text-gray-500">{lessonData.subtitle}</Text>
          </View>

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

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-semibold text-gray-900">
            Progress
          </Text>
          <Text className="text-sm font-medium text-gray-700">
            {calculateProgress()}%
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full">
          <View
            className="h-2 bg-gray-900 rounded-full"
            style={{ width: `${calculateProgress()}%` }}
          />
        </View>
      </View>

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#374151"]}
            tintColor="#374151"
            title={refreshing ? "Updating courses..." : "Pull to refresh"}
            titleColor="#6B7280"
          />
        }
        ListHeaderComponent={() => (
          <View className="px-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Courses
            </Text>
            <Text className="text-sm text-gray-600">
              Complete all {courses.length} courses to master{" "}
              {lessonData.title.toLowerCase()} fundamentals
            </Text>
          </View>
        )}
      />
    </View>
  );
}
