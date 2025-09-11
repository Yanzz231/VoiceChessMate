export interface SpeechToTextResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}

export interface SpeechToTextConfig {
  primaryLanguageCode?: string;
  baseUrl?: string;
}

export class SpeechService {
  private baseUrl: string;
  private idToken: string | null = null;

  constructor(config: SpeechToTextConfig = {}) {
    this.baseUrl =
      config.baseUrl ||
      "https://speech-service-131805767327.us-central1.run.app";
  }

  private async getIdToken(): Promise<string> {
    if (this.idToken) {
      return this.idToken;
    }
    throw new Error("ID Token not available. Please implement authentication.");
  }

  public setIdToken(token: string): void {
    this.idToken = token;
  }

  async speechToText({
    audioData,
    primaryLanguageCode = "id-ID",
  }: {
    audioData: Uint8Array;
    primaryLanguageCode?: string;
  }): Promise<SpeechToTextResult> {
    try {
      const idToken = await this.getIdToken();
      const audioBase64 = this.uint8ArrayToBase64(audioData);

      const response = await fetch(`${this.baseUrl}/v2/speech-to-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          audio_data: audioBase64,
          language_code: primaryLanguageCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.text || "",
          confidence: data.confidence || 0,
          success: true,
        };
      } else {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      return {
        text: "",
        confidence: 0,
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = "";
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
