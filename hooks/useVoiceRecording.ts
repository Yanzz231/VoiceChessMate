import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import { GeminiSpeechService } from "@/services/GeminiSpeechService";

interface UseVoiceRecordingOptions {
  language?: string;
  longPressThreshold?: number;
  onTranscriptComplete?: (result: any) => void;
}

export const useVoiceRecording = (options: UseVoiceRecordingOptions) => {
  const {
    language = "id-ID",
    longPressThreshold = 500,
    onTranscriptComplete,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recording = useRef<Audio.Recording | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserHolding = useRef<boolean>(false);
  const geminiService = useRef<GeminiSpeechService | null>(null);

  useEffect(() => {
    geminiService.current = new GeminiSpeechService({
      apiKey: "AIzaSyB1YPGmB2yJ_qfoKH5mVcWreRWaf0g7aIk",
      language,
    });
  }, [language]);

  const vibrate = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Vibration failed:", error);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Audio permission not granted");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/wav",
          bitsPerSecond: 128000,
        },
      });

      recording.current = newRecording;
      await newRecording.startAsync();
      setIsRecording(true);

      Speech.speak("Listening", {
        language: "en-US",
        pitch: 1.0,
        rate: 1.2,
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      Speech.speak("Recording error", {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording.current) return;

    try {
      setIsRecording(false);
      await recording.current.stopAndUnloadAsync();

      const uri = recording.current.getURI();
      recording.current = null;

      if (uri && geminiService.current) {
        setIsProcessing(true);

        const audioBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const result = await geminiService.current.transcribeAudio(
          audioBase64,
          "audio/wav"
        );

        console.log("Gemini speech recognition result:", result);

        setIsProcessing(false);

        if (result.success && result.text) {
          onTranscriptComplete?.(result);
        } else {
          Speech.speak(result.error || "No speech detected", {
            language: "en-US",
            pitch: 1.0,
            rate: 0.9,
          });
        }

        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error("Error in stopRecording:", error);
      setIsProcessing(false);
      Speech.speak("Processing error", {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    }
  }, [language, onTranscriptComplete]);

  const handleTouchStart = useCallback(() => {
    if (isProcessing || isRecording) {
      return;
    }

    isUserHolding.current = true;

    longPressTimer.current = setTimeout(async () => {
      if (isUserHolding.current) {
        try {
          await vibrate();
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await startRecording();
        } catch (error) {
          console.error("Failed to start recording:", error);
          isUserHolding.current = false;
        }
      }
    }, longPressThreshold);
  }, [isProcessing, isRecording, startRecording, longPressThreshold]);

  const handleTouchEnd = useCallback(async () => {
    isUserHolding.current = false;

    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isRecording) {
      await stopRecording();
    }
  }, [isRecording, stopRecording]);

  const cleanup = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    isUserHolding.current = false;

    if (recording.current) {
      recording.current.stopAndUnloadAsync().catch(console.error);
      recording.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isProcessing,
    isRecording,
    isTranscribing: isProcessing,
    handleTouchStart,
    handleTouchEnd,
    cleanup,
  };
};
