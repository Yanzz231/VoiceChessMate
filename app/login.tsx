import { supabase } from "@/lib/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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
  const lastBackPress = useRef<number>(0);

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
              Alert.alert("Masuk Gagal", error.message);
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
            Alert.alert(
              "Kesalahan Autentikasi",
              "Parameter callback tidak valid"
            );
            setLoading(false);
          }
        } else {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            url
          );

          if (error) {
            Alert.alert("Masuk Gagal", error.message);
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
          "Kesalahan Autentikasi",
          "Terjadi kesalahan saat proses masuk"
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
        Alert.alert("Masuk Gagal", error.message);
        setLoading(false);
      } else if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (err) {
      Alert.alert("Kesalahan Autentikasi", "Gagal memulai proses masuk");
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
                Rasakan setiap langkah - mainkan catur dengan mudah, hanya
                menggunakan suara Anda
              </Text>

              <Text className="text-sm text-gray-600 leading-6 mb-9">
                Tanpa layar, tanpa gangguan, ucapkan langkah Anda, dan dengarkan
                permainan berlangsung. ChessMate dirancang intuitif dan
                memberdayakan, membuat catur dapat diakses dengan cara yang
                terasa imersif untuk semua
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
                    {loading ? "Sedang masuk..." : "Masuk dengan Google"}
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
