import { Chess } from "chess.js";
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";

interface VoiceChessMoveOptions {
  game: Chess;
  onMoveComplete: (move: any, newGame: Chess) => void;
  onLocationQuery?: (locationInfo: string) => void;
  onError?: (error: string) => void;
  baseUrl?: string;
}

interface VoiceChessMoveResponse {
  data: {
    status: "Location" | "Move";
    move: string;
    fen: string;
  };
}

export const useVoiceChessMove = (options: VoiceChessMoveOptions) => {
  const {
    game,
    onMoveComplete,
    onLocationQuery,
    onError,
    baseUrl = "https://voicechessmatebe-production.up.railway.app",
  } = options;
  const [isProcessingMove, setIsProcessingMove] = useState(false);

  const processVoiceMove = useCallback(
    async (transcription: string) => {
      if (!transcription.trim()) {
        onError?.("No command detected");
        return;
      }

      if (isProcessingMove) {
        console.log("Already processing, ignoring duplicate call");
        return;
      }

      setIsProcessingMove(true);
      console.log("Starting voice move processing");

      try {
        const requestBody = {
          fen: game.fen(),
          transcription: transcription
            .replace("voice active", "")
            .replace("voice active.", "")
            .toLowerCase()
            .trim(),
        };

        console.log("Sending request:", requestBody);

        const response = await fetch(`${baseUrl}/api/gameplay/move-by-voice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result: VoiceChessMoveResponse = await response.json();
        console.log("Parsed response:", result);

        if (result.data) {
          if (result.data.status === "Location") {
            const locationInfo = result.data.move;
            console.log("Location query result:", locationInfo);

            Speech.speak(locationInfo, {
              language: "en-US",
              pitch: 1.0,
              rate: 0.8,
            });

            onLocationQuery?.(locationInfo);
          } else if (result.data.status === "Move" && result.data.fen) {
            const newGame = new Chess(result.data.fen);
            const newHistory = newGame.history({ verbose: true });
            const lastMove = newHistory[newHistory.length - 1];

            console.log("Move processed successfully:", lastMove);

            onMoveComplete(lastMove, newGame);

            Speech.speak("Move completed", {
              language: "en-US",
              pitch: 1.0,
              rate: 0.9,
            });
          } else {
            throw new Error("Invalid response data from server");
          }
        } else {
          throw new Error("No data in server response");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        console.error("Voice processing error:", errorMessage);
        onError?.(errorMessage);

        Speech.speak("Command failed", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      } finally {
        setIsProcessingMove(false);
        console.log("Voice move processing finished");
      }
    },
    [game, onMoveComplete, onLocationQuery, onError, baseUrl, isProcessingMove]
  );

  return {
    isProcessingMove,
    processVoiceMove,
  };
};
