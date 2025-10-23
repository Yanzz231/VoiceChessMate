import { useVoiceChessMove } from "@/hooks/useVoiceChessMove";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Chess } from "chess.js";
import * as Speech from "expo-speech";
import { useCallback } from "react";

interface VoiceChessConfig {
  game: Chess;
  onMoveComplete: (move: any, newGame: Chess) => void;
  language?: string;
  longPressThreshold?: number;
}

export const useVoiceChess = ({
  game,
  onMoveComplete,
  language = "id-ID",
  longPressThreshold = 1000,
}: VoiceChessConfig) => {
  const { isProcessingMove, processVoiceMove } = useVoiceChessMove({
    game,
    onMoveComplete,
  });

  const handleTranscriptComplete = useCallback(
    async (result: any) => {
      console.log("Transcript result:", result);

      if (result?.text && result.text.trim()) {
        const transcriptText = result.text.trim();
        console.log("Processing transcript:", transcriptText);
        await processVoiceMove(transcriptText);
      } else if (result?.success === false) {
        console.error("Speech service error:", result.error);
        Speech.speak(result.error || "Speech recognition failed", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      } else {
        console.warn("No transcript text received");
        Speech.speak("No speech detected. Please try again", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      }
    },
    [processVoiceMove]
  );

  const { handleTouchStart, handleTouchEnd, cleanup } = useVoiceRecording({
    language,
    longPressThreshold,
    onTranscriptComplete: handleTranscriptComplete,
  });

  return {
    isProcessingMove,
    handleTouchStart,
    handleTouchEnd,
    cleanup,
    processVoiceMove,
  };
};
