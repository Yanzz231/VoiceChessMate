import { supabase } from "@/lib/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem("supabase_session");
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
        }

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          await AsyncStorage.setItem(
            "supabase_session",
            JSON.stringify(currentSession)
          );
        }
      } catch (error) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session);
        await AsyncStorage.setItem("supabase_session", JSON.stringify(session));
      } else {
        setSession(null);
        await AsyncStorage.removeItem("supabase_session");
      }

      if (event === "INITIAL_SESSION") {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("supabase_session");
      setSession(null);
    } catch (error) {
      // Silent fail
    }
  };

  return {
    session,
    loading,
    signOut,
    user: session?.user || null,
    isAuthenticated: !!session,
  };
};
