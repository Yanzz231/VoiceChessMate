import { SpeechService, SpeechToTextResult } from "@/services/SpeechService";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechServiceOptions {
  baseUrl?: string;
  primaryLanguageCode?: string;
  idToken?: string;
  onTranscriptComplete?: (result: SpeechToTextResult) => void;
  onError?: (error: Error) => void;
}

export const useSpeechService = (options: UseSpeechServiceOptions = {}) => {
  const {
    baseUrl,
    primaryLanguageCode = "id-ID",
    idToken,
    onTranscriptComplete,
    onError,
  } = options;

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const speechService = useRef<SpeechService | null>(null);

  useEffect(() => {
    speechService.current = new SpeechService({
      baseUrl,
      primaryLanguageCode,
    });

    if (idToken) {
      speechService.current.setIdToken(idToken);
    }
  }, [baseUrl, primaryLanguageCode, idToken]);

  const transcribeAudio = useCallback(
    async (audioData: Uint8Array) => {
      if (!speechService.current) {
        const error = new Error("Speech service not initialized");
        onError?.(error);
        return;
      }

      setIsTranscribing(true);
      setError(null);

      try {
        const result = await speechService.current.speechToText({
          audioData,
          primaryLanguageCode,
        });

        if (result.success) {
          setTranscript(result.text);
          setConfidence(result.confidence);
          onTranscriptComplete?.(result);
        } else {
          throw new Error(result.error || "Transcription failed");
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error.message);
        onError?.(error);
      } finally {
        setIsTranscribing(false);
      }
    },
    [primaryLanguageCode, onTranscriptComplete, onError]
  );

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setConfidence(0);
    setError(null);
  }, []);

  const checkServiceHealth = useCallback(async (): Promise<boolean> => {
    if (!speechService.current) return false;
    return speechService.current.checkHealth();
  }, []);

  return {
    isTranscribing,
    transcript,
    confidence,
    error,
    transcribeAudio,
    clearTranscript,
    checkServiceHealth,
  };
};
