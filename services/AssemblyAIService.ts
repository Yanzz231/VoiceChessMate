import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export interface TranscriptionResult {
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface AssemblyAIConfig {
  apiKey: string;
  language?: string;
  punctuate?: boolean;
  format_text?: boolean;
  dual_channel?: boolean;
  webhook_url?: string;
  auto_highlights?: boolean;
  speaker_labels?: boolean;
}

class AssemblyAIService {
  private apiKey: string;
  private baseUrl = "https://api.assemblyai.com/v2";
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      // Request audio recording permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error("Audio recording permission not granted");
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      throw error;
    }
  }

  async startRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        return;
      }

      // Create recording instance
      this.recording = new Audio.Recording();

      // Configure recording options
      const recordingOptions = {
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
      };

      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
      this.isRecording = true;
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      // Reset state
      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        throw new Error("Failed to get recording URI");
      }

      return uri;
    } catch (error) {
      console.error("Error stopping recording:", error);
      this.isRecording = false;
      this.recording = null;
      throw error;
    }
  }

  private async uploadAudio(audioUri: string): Promise<string> {
    try {
      // Read file as binary data instead of base64
      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (!fileInfo.exists) {
        throw new Error("Audio file does not exist");
      }

      // Read file as binary
      const response = await fetch(audioUri);
      const audioBlob = await response.blob();

      const uploadResponse = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: audioBlob,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      const result = await uploadResponse.json();
      return result.upload_url;
    } catch (error) {
      console.error("Error uploading audio:", error);
      throw error;
    }
  }

  private async submitTranscription(
    audioUrl: string,
    config?: Partial<AssemblyAIConfig>
  ): Promise<string> {
    try {
      const transcriptionConfig = {
        audio_url: audioUrl,
        language_code: config?.language || "en",
        punctuate: config?.punctuate ?? true,
        format_text: config?.format_text ?? true,
        dual_channel: config?.dual_channel ?? false,
        webhook_url: config?.webhook_url,
        auto_highlights: config?.auto_highlights ?? false,
        speaker_labels: config?.speaker_labels ?? false,
      };

      const response = await fetch(`${this.baseUrl}/transcript`, {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transcriptionConfig),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Transcription request failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error("Error submitting transcription:", error);
      throw error;
    }
  }

  private async pollTranscription(
    transcriptionId: string
  ): Promise<TranscriptionResult> {
    const maxAttempts = 60;
    const pollInterval = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `${this.baseUrl}/transcript/${transcriptionId}`,
          {
            headers: {
              Authorization: this.apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "completed") {
          return {
            text: result.text || "",
            confidence: result.confidence || 0,
            words: result.words || [],
          };
        } else if (result.status === "error") {
          throw new Error(`Transcription failed: ${result.error}`);
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error(`Polling attempt ${attempt + 1} failed:`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error("Transcription timeout");
  }

  async transcribeFile(
    audioUri: string,
    config?: Partial<AssemblyAIConfig>
  ): Promise<TranscriptionResult> {
    try {
      const audioUrl = await this.uploadAudio(audioUri);
      const transcriptionId = await this.submitTranscription(audioUrl, config);
      const result = await this.pollTranscription(transcriptionId);
      return result;
    } catch (error) {
      console.error("Error in transcription process:", error);
      throw error;
    }
  }

  async transcribeRecording(
    config?: Partial<AssemblyAIConfig>
  ): Promise<TranscriptionResult> {
    try {
      // Stop recording and get the URI
      const audioUri = await this.stopRecording();
      if (!audioUri) {
        throw new Error(
          "No recording available - failed to stop recording or get URI"
        );
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error("Recording file does not exist");
      }

      if (fileInfo.size < 1000) {
        // Less than 1KB
        throw new Error("Recording is too short or empty");
      }

      return await this.transcribeFile(audioUri, config);
    } catch (error) {
      console.error("Error transcribing recording:", error);
      throw error;
    }
  }

  async startRealtimeTranscription(
    onTranscript: (transcript: string) => void,
    onError: (error: Error) => void,
    config?: Partial<AssemblyAIConfig>
  ): Promise<WebSocket> {
    try {
      const tokenResponse = await fetch(`${this.baseUrl}/realtime/token`, {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expires_in: 3600, // 1 hour
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get real-time token");
      }

      const { token } = await tokenResponse.json();

      const ws = new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
      );

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message_type === "FinalTranscript") {
          onTranscript(data.text);
        }
      };

      return ws;
    } catch (error) {
      console.error("Error starting real-time transcription:", error);
      throw error;
    }
  }

  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.recording && this.isRecording) {
        await this.stopRecording();
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}

export default AssemblyAIService;
