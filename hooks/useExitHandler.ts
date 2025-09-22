import { useFocusEffect } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { BackHandler } from "react-native";

interface UseExitHandlerOptions {
  enabled?: boolean;
  appName?: string;
  onExit?: () => void;
}

export const useExitHandler = (options: UseExitHandlerOptions = {}) => {
  const { enabled = true, appName = "ChessMate", onExit } = options;

  const lastBackPress = useRef<number>(0);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleStayHere = () => {
    setShowExitModal(false);
    lastBackPress.current = 0;
  };

  const handleExit = () => {
    setShowExitModal(false);
    if (onExit) {
      onExit();
    } else {
      BackHandler.exitApp();
    }
  };

  const backAction = () => {
    if (!enabled) return false;

    const currentTime = Date.now();

    if (currentTime - lastBackPress.current < 2000) {
      return true;
    }

    lastBackPress.current = currentTime;
    setShowExitModal(true);
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!enabled) return;

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [enabled])
  );

  return {
    showExitModal,
    handleStayHere,
    handleExit,
    appName,
  };
};
