import { supabase } from "@/lib/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CampSvg } from "@/components/icons/Camp";
import { GoogleSvg } from "@/components/icons/Google";

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;

      if (!url.includes("access_token") && !url.includes("auth/callback")) {
        return;
      }

      try {
        if (url.includes("access_token")) {
          const hashParams = new URLSearchParams(url.split("#")[1]);
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");

          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              Alert.alert("Sign In Failed", error.message);
              setLoading(false);
            } else if (data?.session) {
              await AsyncStorage.setItem(
                "supabase_session",
                JSON.stringify(data.session)
              );
              setLoading(false);
            } else {
              setLoading(false);
            }
          } else {
            Alert.alert("Authentication Error", "Invalid callback parameters");
            setLoading(false);
          }
        } else {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            url
          );

          if (error) {
            Alert.alert("Sign In Failed", error.message);
            setLoading(false);
          } else if (data?.session) {
            await AsyncStorage.setItem(
              "supabase_session",
              JSON.stringify(data.session)
            );
            setLoading(false);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        Alert.alert(
          "Authentication Error",
          "Something went wrong during sign in"
        );
        setLoading(false);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const checkExistingSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem("supabase_session");
        if (storedSession) {
          router.replace("/home");
        }
      } catch (error) {
        // Silent fail
      }
    };

    checkExistingSession();

    return () => subscription.remove();
  }, []);

  const handleSignInPress = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "samsungvoice://auth/callback",
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        Alert.alert("Sign In Failed", error.message);
        setLoading(false);
      } else if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (err) {
      Alert.alert("Authentication Error", "Failed to initiate sign in");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <LinearGradient colors={["#6366F1", "#8B5CF6"]} className="flex-1">
        <View className="flex-1 justify-between">
          <View className="flex-[0.6] justify-center items-center pt-24">
            <View className="w-64 h-64 justify-center items-center shadow-xl pt-0.5">
              <CampSvg height={350} width={350} />
            </View>
          </View>

          <View className="flex-[0.4] justify-end">
            <View className="bg-white rounded-t-3xl px-8 pt-10 pb-12 shadow-2xl">
              <View className="flex-row items-center mb-6">
                <View className="w-10 h-10 rounded-lg bg-gray-100 justify-center items-center mr-3">
                  <Text className="text-lg">♟</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  ChessMate
                </Text>
              </View>

              <Text className="text-lg font-semibold text-gray-900 leading-7 mb-4">
                Feel every move - play chess effortlessly, only using your voice
              </Text>

              <Text className="text-sm text-gray-600 leading-6 mb-9">
                No screens, no distraction, speaking your moves, and hearing the
                game unfold. ChessMate is designed to be intuitive and
                empowering, making chess accessible in a way that feels
                immersive for all
              </Text>

              <TouchableOpacity
                onPress={handleSignInPress}
                disabled={loading}
                className="rounded-xl overflow-hidden shadow-lg"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 px-5 items-center justify-center flex flex-row gap-4"
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <GoogleSvg height={20} width={20} />
                  )}
                  <Text className="text-white text-base font-semibold">
                    {loading ? "Signing in..." : "Sign in with Google"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginScreen;
