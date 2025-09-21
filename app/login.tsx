import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAuthHandler } from "@/hooks/useAuthHandler";
import { useExitHandler } from "@/hooks/useExitHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

const LoginScreen = () => {
  const { isAuthenticated } = useAuth();
  const { loading, handleSignInPress } = useAuthHandler();
  const [isVoice, setIsVoice] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (isVoice) {
        await AsyncStorage.setItem("homeVoice", "false");
        setIsVoice(false);
      }
    };

    init();
  }, [isVoice]);

  useExitHandler({
    enabled: !isAuthenticated,
    appName: "ChessMate",
  });

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <LinearGradient colors={["#6366F1", "#8B5CF6"]} className="flex-1">
        <View className="flex-1 justify-between">
          <LoginHeader />

          <View className="flex-[0.4] justify-end">
            <LoginForm loading={loading} onSignInPress={handleSignInPress} />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginScreen;
