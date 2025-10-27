import { USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(
          USER_STORAGE_KEYS.ONBOARDING_COMPLETED
        );
        setOnboardingCompleted(completed === "true");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    const prepareApp = async () => {
      if (!loading && !checkingOnboarding) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, [loading, checkingOnboarding]);

  useEffect(() => {
    if (loading || checkingOnboarding) return;

    const isAuthRoute = pathname === "/login";
    const isOnboardingRoute = pathname === "/onboarding";
    const isPublicRoute =
      pathname === "/" || pathname === "/login" || pathname === "/onboarding";

    const recheckOnboardingAndNavigate = async () => {
      const completed = await AsyncStorage.getItem(
        USER_STORAGE_KEYS.ONBOARDING_COMPLETED
      );
      const isOnboardingActuallyCompleted = completed === "true";

      if (isOnboardingActuallyCompleted !== onboardingCompleted) {
        setOnboardingCompleted(isOnboardingActuallyCompleted);
      }

      if (!isOnboardingActuallyCompleted && !isOnboardingRoute) {
        router.replace("/onboarding");
      } else if (!isAuthenticated && !isPublicRoute) {
        router.replace("/login");
      } else if (isAuthenticated && isAuthRoute) {
        router.replace("/home");
      } else if (isAuthenticated && pathname === "/") {
        router.replace("/home");
      }
    };

    recheckOnboardingAndNavigate();
  }, [
    loading,
    checkingOnboarding,
    onboardingCompleted,
    isAuthenticated,
    pathname,
    router,
  ]);

  if (loading || checkingOnboarding || !appReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  const isAuthRoute = pathname === "/login";
  const isOnboardingRoute = pathname === "/onboarding";
  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/onboarding";

  if (
    !appReady ||
    (!isAuthenticated && !isPublicRoute) ||
    (isAuthenticated && (isAuthRoute || pathname === "/")) ||
    (!onboardingCompleted && !isOnboardingRoute)
  ) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="home" />
      <Stack.Screen name="play" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="chess-game" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="analyze" />
      <Stack.Screen name="lesson-game/[courseId]" />
      <Stack.Screen name="game-detail/[gameId]" />
    </Stack>
  );
}
