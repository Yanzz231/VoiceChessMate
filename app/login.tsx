import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAuthHandler } from "@/hooks/useAuthHandler";
import { useExitHandler } from "@/hooks/useExitHandler";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

const LoginScreen = () => {
  const { isAuthenticated } = useAuth();
  const { loading, handleSignInPress } = useAuthHandler();

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
