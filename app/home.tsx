import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ICONS
import { Ai } from "@/components/icons/Ai";
import { Analyze } from "@/components/icons/Analyze";
import { Lesson } from "@/components/icons/Lesson";
import { Scan } from "@/components/icons/Scan";
import { Setting } from "@/components/icons/Setting";

export default function Home() {
  const { user, signOut } = useAuth();

  const MenuCard = ({
    id,
    title,
    description,
    onPress,
  }: {
    id: string;
    title: string;
    description: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View
          className={`w-12 h-12 rounded-xl justify-center items-center mr-4`}
        >
          {id == "ai" && <Ai height={40} width={40} />}
          {id == "scan" && <Scan height={40} width={40} />}
          {id == "setting" && <Setting height={40} width={40} />}
          {id == "lesson" && <Lesson height={40} width={40} />}
          {id == "analyze" && <Analyze height={40} width={40} />}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">{title}</Text>
          <Text className="text-sm text-gray-500 leading-5">{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ProfileImage = () => {
    const photoUrl =
      user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
    const userName =
      user?.user_metadata?.name || user?.user_metadata?.full_name || "Guest";

    if (photoUrl) {
      return (
        <Image
          source={{ uri: photoUrl }}
          className="w-10 h-10 rounded-full"
          resizeMode="cover"
        />
      );
    }

    return (
      <View className="w-10 h-10 rounded-full bg-white/20 justify-center items-center">
        <Text className="text-white font-semibold text-lg">
          {userName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#6366F1", "#8B5CF6"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View className="mr-3">
                <ProfileImage />
              </View>
              <View>
                <Text className="text-white/80 text-sm">
                  Hi {user?.user_metadata?.name?.split(" ")[0] || "Guest"}
                </Text>
                <Text className="text-white text-lg font-semibold">
                  Welcome 🎯
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={signOut}
              className="bg-white/20 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-medium">Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Main Game Card */}
          <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
            <View className="items-center">
              <Text className="text-white text-xl font-bold mb-2">
                Ready to Play Chess?
              </Text>
              <Text className="text-white/80 text-center text-sm mb-6">
                Start a new voice-controlled chess game and experience
                hands-free gameplay
              </Text>
              <TouchableOpacity className="bg-white rounded-2xl px-8 py-4">
                <Text className="text-indigo-600 font-bold text-base">
                  Start New Game
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu Cards */}
        <View className="flex-1 bg-gray-50 rounded-t-[32px] px-6 pt-8">
          <ScrollView showsVerticalScrollIndicator={false}>
            <MenuCard
              id="ai"
              title="Playing With AI"
              description="Challenge our advanced AI opponent with different difficulty levels and voice commands"
              onPress={() => {
                /* Navigate to AI game */
              }}
            />

            <MenuCard
              id="scan"
              title="Scan"
              description="Analyze your chess positions and get strategic insights using voice analysis"
              onPress={() => {
                /* Navigate to scanner */
              }}
            />

            <MenuCard
              id="lesson"
              title="Lesson"
              description="Learn chess fundamentals, tactics, and advanced strategies through interactive voice lessons"
              onPress={() => {
                /* Navigate to lessons */
              }}
            />

            <MenuCard
              id="analyze"
              title="Analyze"
              description="Review your game history, track progress, and analyze your chess performance over time"
              onPress={() => {
                /* Navigate to analytics */
              }}
            />
            <MenuCard
              id="setting"
              title="Settings"
              description="Customize voice commands, difficulty levels, and personalize your chess experience"
              onPress={() => {
                /* Navigate to settings */
              }}
            />

            <View className="h-8" />
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
