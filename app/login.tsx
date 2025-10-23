import { LoginForm } from "@/components/auth/LoginForm";
import { ExitConfirmationModal } from "@/components/ExitConfirmationModal";
import { ErrorModal } from "@/components/modals/ErrorModal";
import { WCAGColors } from "@/constants/wcagColors";
import { useAuth } from "@/hooks/useAuth";
import { useAuthHandler } from "@/hooks/useAuthHandler";
import { useExitHandler } from "@/hooks/useExitHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";

const LoginScreen = () => {
  const { isAuthenticated } = useAuth();
  const { loading, handleSignInPress, errorModal, hideError } = useAuthHandler();
  const [isVoice, setIsVoice] = useState(true);

  const { showExitModal, handleStayHere, handleExit, appName } = useExitHandler(
    {
      enabled: !isAuthenticated,
      appName: "ChessMate",
    }
  );

  useEffect(() => {
    const init = async () => {
      if (isVoice) {
        await AsyncStorage.setItem("homeVoice", "false");
        setIsVoice(false);
      }
    };

    init();
  }, [isVoice]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={WCAGColors.primary.yellow} />
      <LinearGradient
        colors={[WCAGColors.primary.yellowLight, WCAGColors.primary.yellow, WCAGColors.primary.yellowDark]}
        locations={[0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        <LoginForm loading={loading} onSignInPress={handleSignInPress} />
      </LinearGradient>

      <ExitConfirmationModal
        visible={showExitModal}
        appName={appName}
        onStayHere={handleStayHere}
        onExit={handleExit}
      />

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={hideError}
      />
    </>
  );
};

export default LoginScreen;
