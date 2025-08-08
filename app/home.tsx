import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeMenuList } from "@/components/home/HomeMenuList";
import { useAuth } from "@/hooks/useAuth";
import { useExitHandler } from "@/hooks/useExitHandler";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

export default function Home() {
  const { user, signOut } = useAuth();

  useExitHandler({
    enabled: true,
    appName: "ChessMate",
  });

  const { handleTouchStart, handleTouchEnd, cleanup } = useVoiceRecording({
    apiKey: "37c72e8e5dd344939db0183d6509ceec",
    language: "id",
    longPressThreshold: 3000,
    onTranscriptComplete: (result) => {
      console.log("Transcript result:", result);
    },
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
