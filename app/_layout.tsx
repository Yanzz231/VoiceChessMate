import { useAuth } from "@/hooks/useAuth";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import "../global.css";

export default function RootLayout() {
  const { loading, isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login";
    const isPublicRoute = pathname === "/" || pathname === "/login";

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    } else if (isAuthenticated && isAuthRoute) {
      router.replace("/home");
    } else if (isAuthenticated && pathname === "/") {
      router.replace("/home");
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const isAuthRoute = pathname === "/login";
  const isPublicRoute = pathname === "/" || pathname === "/login";

  if (
    (!isAuthenticated && !isPublicRoute) ||
    (isAuthenticated && (isAuthRoute || pathname === "/"))
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
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
