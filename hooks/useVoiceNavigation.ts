import { useRouter } from "expo-router";
import { useCallback } from "react";

interface ChatResponse {
  response: string;
  screen: string;
  error?: string;
}

interface UseVoiceNavigationOptions {
  apiUrl?: string;
  onNavigationStart?: (screen: string) => void;
  onNavigationError?: (error: string) => void;
}

export const useVoiceNavigation = (options: UseVoiceNavigationOptions = {}) => {
  const router = useRouter();
  const {
    apiUrl = "https://voicechessmatebe-production.up.railway.app/api/chat/gemini",
    onNavigationStart,
    onNavigationError,
  } = options;

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
          // router.push('/lesson');
          break;
        case "analyze":
          // router.push('/analyze');
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

      try {
        console.log(`Processing voice command: "${message}"`);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ChatResponse = await response.json();

        if (result.error) {
          console.error("API Error:", result.error);
          onNavigationError?.(result.error);
          return;
        }

        if (result.screen) {
          navigateToScreen(result.screen);
        } else {
          onNavigationError?.(`No destination determined`);
        }
      } catch (error) {
        console.error("Voice command processing error:", error);
        onNavigationError?.(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    [apiUrl, navigateToScreen, onNavigationError]
  );

  return {
    processVoiceCommand,
    navigateToScreen,
  };
};
