import { supabase } from "@/lib/supabaseClient";
import { userService } from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export const useAuthHandler = () => {
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  const showError = (title: string, message: string) => {
    setErrorModal({ visible: true, title, message });
  };

  const hideError = () => {
    setErrorModal({ visible: false, title: '', message: '' });
  };

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;

      if (!url.includes("access_token") && !url.includes("auth/callback")) {
        return;
      }

      try {
        setLoading(true);

        let sessionData;

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
              showError("Masuk Gagal", error.message);
              return;
            }
            sessionData = data.session;
          } else {
            showError("Kesalahan Autentikasi", "Parameter callback tidak valid");
            return;
          }
        } else {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            url
          );

          if (error) {
            showError("Masuk Gagal", error.message);
            return;
          }
          sessionData = data.session;
        }

        if (sessionData) {
          await AsyncStorage.setItem(
            "supabase_session",
            JSON.stringify(sessionData)
          );

          const userId = sessionData.user?.id;
          if (userId) {
            await AsyncStorage.setItem("user_id", userId);
            await userService.createUser(userId);
          }
        }
      } catch (err) {
        showError("Kesalahan Autentikasi", "Terjadi kesalahan saat proses masuk");
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
      } catch (error) {}
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
        showError("Masuk Gagal", error.message);
        setLoading(false);
      } else if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (err) {
      showError("Kesalahan Autentikasi", "Gagal memulai proses masuk");
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignInPress,
    errorModal,
    hideError,
  };
};
