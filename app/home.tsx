import { useAssemblyAI } from "@/hooks/useAssemblyAI";
import { useAuth } from "@/hooks/useAuth";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ai } from "@/components/icons/Ai";
import { Analyze } from "@/components/icons/Analyze";
import { Lesson } from "@/components/icons/Lesson";
import { Scan } from "@/components/icons/Scan";
import { Setting } from "@/components/icons/Setting";

export default function Home() {
  const router = useRouter();

  const { user, signOut } = useAuth();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartTime = useRef<number>(0);
  const longPressThreshold = 3000;
  const isUserHolding = useRef<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const lastBackPress = useRef<number>(0);
  const forceStopRef = useRef<boolean>(false);

  const {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    clearError,
  } = useAssemblyAI({
    apiKey: "37c72e8e5dd344939db0183d6509ceec",
    autoTranscribe: true,
    transcriptionConfig: {
      language: "id",
      punctuate: true,
      format_text: true,
      speaker_labels: false,
    },
    onTranscriptComplete: (result) => {
      setIsProcessing(false);

      console.log(result);
    },
  });

  const handleTouchStart = useCallback(() => {
    if (isProcessing || isRecording || isTranscribing) {
      return;
    }

    isUserHolding.current = true;
    clearError();

    longPressTimer.current = setTimeout(async () => {
      if (isUserHolding.current) {
        try {
          recordingStartTime.current = Date.now();

          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await startRecording();
        } catch (error) {
          console.error("Failed to start recording:", error);
          setIsProcessing(false);
          isUserHolding.current = false;
        }
      } else {
        console.log("User released before 3 seconds - not starting recording");
      }
    }, longPressThreshold);
  }, [isProcessing, isRecording, isTranscribing, startRecording, clearError]);

  const handleTouchEnd = useCallback(async () => {
    isUserHolding.current = false;

    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isRecording) {
      forceStopRef.current = true;
      try {
        await stopRecording();
        console.log("Stop recording called successfully");
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  }, [isRecording, stopRecording]);

  useEffect(() => {
    const showExitConfirmation = () => {
      Alert.alert(
        "Keluar dari ChessMate",
        "Apakah Anda yakin ingin menutup aplikasi ChessMate?",
        [
          {
            text: "Tetap di Sini",
            style: "cancel",
            onPress: () => {
              lastBackPress.current = 0;
            },
          },
          {
            text: "Ya, Keluar",
            style: "destructive",
            onPress: () => {
              BackHandler.exitApp();
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            lastBackPress.current = 0;
          },
        }
      );
    };

    const backAction = () => {
      const currentTime = Date.now();

      if (currentTime - lastBackPress.current < 2000) {
        return true;
      }

      lastBackPress.current = currentTime;
      showExitConfirmation();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      isUserHolding.current = false;
      forceStopRef.current = false;
    };
  }, []);

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
    <View
      className="flex-1"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <LinearGradient colors={["#6366F1", "#8B5CF6"]} className="flex-1">
        <SafeAreaView className="flex-1">
          <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

          <View className="px-6 pt-10">
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
          </View>

          <View className="flex-1 bg-gray-50 rounded-t-[32px] px-6 pt-8">
            <TouchableOpacity
              onPress={() => router.push("/play")}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl justify-center items-center mr-4">
                  <Ai height={40} width={40} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Play with AI
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">
                    Challenge advanced AI opponents with voice-controlled moves
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl justify-center items-center mr-4">
                  <Scan height={40} width={40} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Scan
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">
                    Analyze chess positions and get strategic insights
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl justify-center items-center mr-4">
                  <Lesson height={40} width={40} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Lesson
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">
                    Learn chess through voice-guided tutorials and exercises
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl justify-center items-center mr-4">
                  <Analyze height={40} width={40} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Analyze
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">
                    Review performance and track improvement over time
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl justify-center items-center mr-4">
                  <Setting height={40} width={40} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Settings
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">
                    Customize voice commands and game preferences
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
