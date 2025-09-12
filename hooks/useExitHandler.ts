import { useRef } from "react";
import { Alert, BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

interface UseExitHandlerOptions {
  enabled?: boolean;
  appName?: string;
  onExit?: () => void;
}

export const useExitHandler = (options: UseExitHandlerOptions = {}) => {
  const { enabled = true, appName = "ChessMate", onExit } = options;

  const lastBackPress = useRef<number>(0);

  const showExitConfirmation = () => {
    Alert.alert(
      `Exit ${appName}`,
      `Are you sure you want to close the ${appName} app?`,
      [
        {
          text: "Stay Here",
          style: "cancel",
          onPress: () => {
            lastBackPress.current = 0;
          },
        },
        {
          text: "Yes, Exit",
          style: "destructive",
          onPress: () => {
            if (onExit) {
              onExit();
            } else {
              BackHandler.exitApp();
            }
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
    if (!enabled) return false;

    const currentTime = Date.now();

    if (currentTime - lastBackPress.current < 2000) {
      return true;
    }

    lastBackPress.current = currentTime;
    showExitConfirmation();
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
};
