import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeMenuList } from "@/components/home/HomeMenuList";
import { useAuth } from "@/hooks/useAuth";
import { useExitHandler } from "@/hooks/useExitHandler";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

export default function Home() {
  const { user, signOut } = useAuth();

  useExitHandler({
    enabled: true,
    appName: "ChessMate",
  });

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

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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

          <HomeHeader user={user} onSignOut={signOut} />
          <HomeMenuList />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
