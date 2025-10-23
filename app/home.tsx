import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeMenuList } from "@/components/home/HomeMenuList";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Modal,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const lastBackPress = useRef<number>(0);

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

  useEffect(() => {
    const initVoice = async () => {
      const homeVoice = await AsyncStorage.getItem("homeVoice");

      if (homeVoice === "false") {
        Speech.speak(
          "Hey There, Welcome to ChessMate. Hold Your Screen for a voice mode",
          {
            language: "en-US",
            pitch: 1.0,
            rate: 0.9,
          }
        );

        await AsyncStorage.setItem("homeVoice", "true");
      }
    };

    initVoice();
  }, []);

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
    language: "id-ID",
    longPressThreshold: 1000,
    onTranscriptComplete: handleTranscriptComplete,
  });

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
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

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const renderLogoutModal = () => {
    if (!showLogoutModal) return null;

    return (
      <Modal visible={showLogoutModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Logout
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Are you sure you want to logout from your account?
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                onPress={confirmLogout}
                className="bg-red-600 py-4 rounded-2xl shadow-lg active:bg-red-700"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Yes, Logout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-gray-700 text-lg font-medium text-center">
                  Cancel
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
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Exit ChessMate
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Are you sure you want to close the ChessMate app?
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                onPress={confirmExit}
                className="bg-red-600 py-4 rounded-2xl shadow-lg active:bg-red-700"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Yes, Exit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={cancelExit}
                className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-gray-700 text-lg font-medium text-center">
                  Stay Here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

          <HomeHeader user={user} onSignOut={handleLogout} />
          <HomeMenuList />
        </SafeAreaView>
      </LinearGradient>

      {renderLogoutModal()}
      {renderExitModal()}
    </View>
  );
}
