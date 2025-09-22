import { useVoiceChessMove } from "@/hooks/useVoiceChessMove";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Chess } from "chess.js";
import * as Speech from "expo-speech";
import { useCallback } from "react";

interface VoiceChessConfig {
  game: Chess;
  onMoveComplete: (move: any, newGame: Chess) => void;
  apiKey?: string;
  language?: string;
  longPressThreshold?: number;
}

export const useVoiceChess = ({
  game,
  onMoveComplete,
  apiKey = "37c72e8e5dd344939db0183d6509ceec",
  language = "id",
  longPressThreshold = 1000,
}: VoiceChessConfig) => {
  const { isProcessingMove, processVoiceMove } = useVoiceChessMove({
    game,
    onMoveComplete,
  });

  const handleTranscriptComplete = useCallback(
    async (result: any) => {
      if (result?.text) {
        const transcriptText = result.text.trim();
        await processVoiceMove(transcriptText);
      } else {
        Speech.speak("Command not understood", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      }
    },
    [processVoiceMove]
  );

  const { handleTouchStart, handleTouchEnd, cleanup } = useVoiceRecording({
    apiKey,
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
