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
  private baseUrl = "https://n8n.api.geniusgrowth.ai/webhook/reihan-stt";
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.setupAudio();
  }

  private async setupAudio(): Promise<void> {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error("Audio recording permission not granted");
      }

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

      this.recording = new Audio.Recording();

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

      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        throw new Error("Failed to get recording URI");
      }

      return uri;
    } catch (error) {
      this.isRecording = false;
      this.recording = null;
      throw error;
    }
  }

  async transcribeFile(
    audioUri: string,
    config?: Partial<AssemblyAIConfig>
  ): Promise<TranscriptionResult> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error("Audio file does not exist");
      }

      if ((fileInfo as any).size && (fileInfo as any).size < 1000) {
        throw new Error("Audio file is too small");
      }

      const response = await fetch(audioUri);
      const audioBlob = await response.blob();

      const webhookResponse = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: audioBlob,
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        throw new Error(
          `Webhook failed: ${webhookResponse.status} - ${errorText}`
        );
      }

      const responseText = await webhookResponse.text();

      if (!responseText || responseText.trim() === "") {
        return await this.tryAlternatives(audioUri, audioBlob);
      }

      return this.parseResponse(responseText);
    } catch (error) {
      throw error;
    }
  }

  private async tryAlternatives(
    audioUri: string,
    audioBlob: Blob
  ): Promise<TranscriptionResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
        },
        body: audioBlob,
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          return this.parseResponse(text);
        }
      }
    } catch (error) {
      // Continue to next method
    }

    try {
      const formData = new FormData();
      const fileName = audioUri.split("/").pop() || "recording.wav";

      formData.append("audio", {
        uri: audioUri,
        type: "audio/wav",
        name: fileName,
      } as any);

      const response = await fetch(this.baseUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          return this.parseResponse(text);
        }
      }
    } catch (error) {
      // Continue to next method
    }

    try {
      const base64Data = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64Data,
          format: "wav",
          encoding: "base64",
        }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          return this.parseResponse(text);
        }
      }
    } catch (error) {
      // All methods failed
    }

    return {
      text: "Webhook not responding",
      confidence: 0.0,
      words: [],
    };
  }

  private parseResponse(responseText: string): TranscriptionResult {
    try {
      const result = JSON.parse(responseText);

      const text =
        result.content?.parts?.[0]?.text ||
        result.text ||
        result.transcript ||
        result.transcription ||
        responseText;

      return {
        text: text || "No text found in response",
        confidence: result.confidence || 0.9,
        words: result.words || [],
      };
    } catch (jsonError) {
      return {
        text: responseText,
        confidence: 0.8,
        words: [],
      };
    }
  }

  async transcribeRecording(
    config?: Partial<AssemblyAIConfig>
  ): Promise<TranscriptionResult> {
    try {
      const audioUri = await this.stopRecording();
      if (!audioUri) {
        throw new Error("No recording available");
      }

      return await this.transcribeFile(audioUri, config);
    } catch (error) {
      throw error;
    }
  }

  async startRealtimeTranscription(
    onTranscript: (transcript: string) => void,
    onError: (error: Error) => void,
    config?: Partial<AssemblyAIConfig>
  ): Promise<WebSocket> {
    try {
      const ws = new WebSocket(
        `wss://n8n.api.geniusgrowth.ai/webhook/reihan-stt-ws`
      );

      ws.onopen = () => {};

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const text =
            data.content?.parts?.[0]?.text || data.text || event.data;
          if (text && text.trim()) {
            onTranscript(text);
          }
        } catch (parseError) {
          if (event.data && event.data.trim()) {
            onTranscript(event.data);
          }
        }
      };

      ws.onerror = (error) => {
        onError(new Error("WebSocket connection error"));
      };

      ws.onclose = () => {};

      return ws;
    } catch (error) {
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
      // Silent fail
    }
  }
}

export default AssemblyAIService;
