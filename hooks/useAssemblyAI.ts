import AssemblyAIService, {
  AssemblyAIConfig,
  TranscriptionResult,
} from "@/services/AssemblyAIService";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAssemblyAIResult {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcribeFile: (
    audioUri: string,
    config?: Partial<AssemblyAIConfig>
  ) => Promise<void>;
  clearTranscript: () => void;
  clearError: () => void;
}

interface UseAssemblyAIOptions {
  apiKey: string;
  autoTranscribe?: boolean;
  transcriptionConfig?: Partial<AssemblyAIConfig>;
  onTranscriptComplete?: (result: TranscriptionResult) => void;
  onError?: (error: Error) => void;
}

export const useAssemblyAI = (
  options: UseAssemblyAIOptions
): UseAssemblyAIResult => {
  const {
    apiKey,
    autoTranscribe = true,
    transcriptionConfig,
    onTranscriptComplete,
    onError,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const assemblyAI = useRef<AssemblyAIService | null>(null);
  const isInitializingRef = useRef(false);

  // Initialize AssemblyAI service
  useEffect(() => {
    const initializeService = async () => {
      if (assemblyAI.current || isInitializingRef.current) return;

      isInitializingRef.current = true;

      try {
        assemblyAI.current = new AssemblyAIService(apiKey);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initialize AssemblyAI";
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeService();
  }, [apiKey, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (assemblyAI.current) {
        assemblyAI.current.cleanup().catch(console.error);
        assemblyAI.current = null;
      }
    };
  }, []);

  const handleError = useCallback(
    (err: Error) => {
      const errorMessage = err.message;
      setError(errorMessage);
      setIsRecording(false);
      setIsTranscribing(false);
      onError?.(err);
    },
    [onError]
  );

  const handleTranscriptionResult = useCallback(
    (result: TranscriptionResult) => {
      setTranscript(result.text);
      setConfidence(result.confidence);
      setIsTranscribing(false);
      onTranscriptComplete?.(result);
    },
    [onTranscriptComplete]
  );

  const startRecording = useCallback(async () => {
    try {
      if (!assemblyAI.current) {
        throw new Error("AssemblyAI service not initialized");
      }

      if (isRecording || isTranscribing) {
        return;
      }

      setError(null);
      setIsRecording(true);

      await assemblyAI.current.startRecording();
    } catch (err) {
      setIsRecording(false);
      handleError(
        err instanceof Error ? err : new Error("Failed to start recording")
      );
    }
  }, [handleError, isRecording, isTranscribing]);

  const stopRecording = useCallback(async () => {
    try {
      if (!assemblyAI.current) {
        throw new Error("AssemblyAI service not initialized");
      }

      if (!isRecording) {
        return;
      }

      setIsRecording(false);

      if (autoTranscribe) {
        setIsTranscribing(true);

        // Add a small delay to ensure recording is properly stopped
        setTimeout(async () => {
          try {
            if (!assemblyAI.current) return;

            const result = await assemblyAI.current.transcribeRecording(
              transcriptionConfig
            );
            handleTranscriptionResult(result);
          } catch (err) {
            handleError(
              err instanceof Error
                ? err
                : new Error("Failed to transcribe recording")
            );
          }
        }, 200);
      } else {
        await assemblyAI.current.stopRecording();
      }
    } catch (err) {
      setIsRecording(false);
      setIsTranscribing(false);
      handleError(
        err instanceof Error ? err : new Error("Failed to stop recording")
      );
    }
  }, [
    autoTranscribe,
    transcriptionConfig,
    handleError,
    handleTranscriptionResult,
    isRecording,
  ]);

  const transcribeFile = useCallback(
    async (audioUri: string, config?: Partial<AssemblyAIConfig>) => {
      try {
        if (!assemblyAI.current) {
          throw new Error("AssemblyAI service not initialized");
        }

        setError(null);
        setIsTranscribing(true);

        const finalConfig = { ...transcriptionConfig, ...config };
        const result = await assemblyAI.current.transcribeFile(
          audioUri,
          finalConfig
        );
        handleTranscriptionResult(result);
      } catch (err) {
        handleError(
          err instanceof Error ? err : new Error("Failed to transcribe file")
        );
      }
    },
    [transcriptionConfig, handleError, handleTranscriptionResult]
  );

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setConfidence(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    confidence,
    error,
    startRecording,
    stopRecording,
    transcribeFile,
    clearTranscript,
    clearError,
  };
};
