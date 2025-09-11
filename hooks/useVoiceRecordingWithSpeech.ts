import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeechService } from "./useSpeechService";

interface UseVoiceRecordingWithSpeechOptions {
  baseUrl?: string;
  primaryLanguageCode?: string;
  idToken?: string;
  longPressThreshold?: number;
  onTranscriptComplete?: (result: any) => void;
}

export const useVoiceRecordingWithSpeech = (
  options: UseVoiceRecordingWithSpeechOptions
) => {
  const {
    baseUrl,
    primaryLanguageCode = "id-ID",
    idToken,
    longPressThreshold = 3000,
    onTranscriptComplete,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recording = useRef<Audio.Recording | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserHolding = useRef<boolean>(false);

  const {
    isTranscribing,
    transcript,
    confidence,
    error,
    transcribeAudio,
    clearTranscript,
    checkServiceHealth,
  } = useSpeechService({
    baseUrl,
    primaryLanguageCode,
    idToken,
    onTranscriptComplete: (result) => {
      setIsProcessing(false);
      onTranscriptComplete?.(result);
    },
    onError: (error) => {
      setIsProcessing(false);
    },
  });

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

      Speech.speak("Voice active", {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording.current) return;

    try {
      setIsRecording(false);
      await recording.current.stopAndUnloadAsync();

      const uri = recording.current.getURI();
      recording.current = null;

      if (uri) {
        setIsProcessing(true);

        Speech.speak("Processing...", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });

        const audioData = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        await transcribeAudio(bytes);
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      setIsProcessing(false);
    }
  }, [transcribeAudio]);

  const handleTouchStart = useCallback(() => {
    if (isProcessing || isRecording || isTranscribing) {
      return;
    }

    isUserHolding.current = true;
    clearTranscript();

    longPressTimer.current = setTimeout(async () => {
      if (isUserHolding.current) {
        try {
          await vibrate();
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await startRecording();
        } catch (error) {
          isUserHolding.current = false;
        }
      }
    }, longPressThreshold);
  }, [
    isProcessing,
    isRecording,
    isTranscribing,
    startRecording,
    clearTranscript,
    longPressThreshold,
  ]);

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
    isRecording,
    isTranscribing,
    isProcessing,
    transcript,
    confidence,
    error,
    handleTouchStart,
    handleTouchEnd,
    cleanup,
    checkServiceHealth,
  };
};
