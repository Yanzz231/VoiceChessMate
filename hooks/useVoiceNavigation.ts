import { useRouter } from "expo-router";
import { useCallback, useRef, useEffect } from "react";
import { GeminiNavigationService } from "@/services/GeminiNavigationService";

interface UseVoiceNavigationOptions {
  onNavigationStart?: (screen: string) => void;
  onNavigationError?: (error: string) => void;
}

export const useVoiceNavigation = (options: UseVoiceNavigationOptions = {}) => {
  const router = useRouter();
  const { onNavigationStart, onNavigationError } = options;

  const navigationService = useRef<GeminiNavigationService | null>(null);

  useEffect(() => {
    navigationService.current = new GeminiNavigationService(
      "AIzaSyB1YPGmB2yJ_qfoKH5mVcWreRWaf0g7aIk"
    );
  }, []);

  const navigateToScreen = useCallback(
    (screen: string) => {
      console.log(`Navigating to: ${screen}`);
      onNavigationStart?.(screen);

      switch (screen) {
        case "scan":
          router.push("/scan");
          break;
        case "play":
          router.push("/play");
          break;
        case "lesson":
          router.push("/home");
          break;
        case "analyze":
          router.push("/analyze");
          break;
        case "setting":
          router.push("/settings");
          break;
        default:
          console.warn(`Unknown screen: ${screen}`);
          onNavigationError?.(`Unknown destination: ${screen}`);
      }
    },
    [router, onNavigationStart, onNavigationError]
  );

  const processVoiceCommand = useCallback(
    async (message: string) => {
      if (!message || message.trim().length === 0) {
        onNavigationError?.("Empty voice command");
        return;
      }

      if (!navigationService.current) {
        onNavigationError?.("Navigation service not initialized");
        return;
      }

      try {
        const cleanMessage = message
          .replace("Voice active.", "")
          .replace("Listening", "")
          .trim();

        console.log(`Processing voice command: "${cleanMessage}"`);

        const result = await navigationService.current.determineScreen(
          cleanMessage
        );

        console.log("Navigation result:", result);

        if (result.success && result.screen) {
          navigateToScreen(result.screen);
        } else {
          onNavigationError?.(result.error || "Could not determine destination");
        }
      } catch (error) {
        console.error("Voice navigation error:", error);
        onNavigationError?.(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    [navigateToScreen, onNavigationError]
  );

  return {
    processVoiceCommand,
    navigateToScreen,
  };
};
