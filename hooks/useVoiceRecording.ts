import { useAssemblyAI } from "@/hooks/useAssemblyAI";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceRecordingOptions {
  apiKey: string;
  language?: string;
  longPressThreshold?: number;
  onTranscriptComplete?: (result: any) => void;
}

export const useVoiceRecording = (options: UseVoiceRecordingOptions) => {
  const {
    apiKey,
    language = "id",
    longPressThreshold = 3000,
    onTranscriptComplete,
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartTime = useRef<number>(0);
  const isUserHolding = useRef<boolean>(false);
  const forceStopRef = useRef<boolean>(false);

  const vibrate = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Vibration failed:", error);
    }
  };

  const {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    clearError,
  } = useAssemblyAI({
    apiKey,
    autoTranscribe: true,
    transcriptionConfig: {
      language,
      punctuate: true,
      format_text: true,
      speaker_labels: false,
    },
    onTranscriptComplete: (result) => {
      setIsProcessing(false);

      onTranscriptComplete?.(result);
    },
  });

  useEffect(() => {
    if (isRecording) {
      Speech.speak("Voice active", {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    }
  }, [isRecording]);

  const handleTouchStart = useCallback(() => {
    if (isProcessing || isRecording || isTranscribing) {
      return;
    }

    isUserHolding.current = true;
    clearError();

    longPressTimer.current = setTimeout(async () => {
      if (isUserHolding.current) {
        try {
          recordingStartTime.current = Date.now();
          vibrate();
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await startRecording();
        } catch (error) {
          console.error("Failed to start recording:", error);
          setIsProcessing(false);
          isUserHolding.current = false;
        }
      }
    }, longPressThreshold);
  }, [
    isProcessing,
    isRecording,
    isTranscribing,
    startRecording,
    clearError,
    longPressThreshold,
  ]);

  const handleTouchEnd = useCallback(async () => {
    isUserHolding.current = false;

    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isRecording) {
      forceStopRef.current = true;
      try {
        await stopRecording();

        Speech.speak("Waiting for response", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      } catch (error) {
        // console.error("Error stopping recording:", error);
      }
    }
  }, [isRecording, stopRecording]);

  const cleanup = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    isUserHolding.current = false;
    forceStopRef.current = false;
  };

  return {
    isProcessing,
    isRecording,
    isTranscribing,
    handleTouchStart,
    handleTouchEnd,
    cleanup,
  };
};
