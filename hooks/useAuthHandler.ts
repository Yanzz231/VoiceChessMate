import { supabase } from "@/lib/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useAuthHandler = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;

      if (!url.includes("access_token") && !url.includes("auth/callback")) {
        return;
      }

      try {
        setLoading(true);

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
            } else if (data?.session) {
              await AsyncStorage.setItem(
                "supabase_session",
                JSON.stringify(data.session)
              );
            }
          } else {
            Alert.alert(
              "Kesalahan Autentikasi",
              "Parameter callback tidak valid"
            );
          }
        } else {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            url
          );

          if (error) {
            Alert.alert("Masuk Gagal", error.message);
          } else if (data?.session) {
            await AsyncStorage.setItem(
              "supabase_session",
              JSON.stringify(data.session)
            );
          }
        }
      } catch (err) {
        Alert.alert(
          "Kesalahan Autentikasi",
          "Terjadi kesalahan saat proses masuk"
        );
      } finally {
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

  return {
    loading,
    handleSignInPress,
  };
};
