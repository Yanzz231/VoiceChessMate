export interface GeminiSpeechResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}

export interface GeminiSpeechConfig {
  apiKey: string;
  language?: string;
}

export class GeminiSpeechService {
  private apiKey: string;
  private language: string;
  private baseUrl: string =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

  constructor(config: GeminiSpeechConfig) {
    this.apiKey = config.apiKey;
    this.language = config.language || "id-ID";
  }

  async transcribeAudio(
    audioBase64: string,
    mimeType: string = "audio/wav"
  ): Promise<GeminiSpeechResult> {
    try {
      const prompt =
        this.language === "id-ID"
          ? `Transkripsi audio voice command berikut ke dalam teks bahasa Indonesia yang AKURAT.

PENTING:
- User sedang memberikan perintah navigasi aplikasi chess
- Kata kunci yang mungkin: setting, pengaturan, analisis, scan, pindai, belajar, pelajaran, main, bermain
- Dengarkan dengan teliti, terutama untuk kata "setting" (bukan "cycling", "sitting", atau kata lain)
- Berikan HANYA teks transkripsi tanpa penjelasan tambahan
- Jangan tambahkan kata "Listening" di awal

Transkripsi:`
          : `Transcribe this voice command audio to text ACCURATELY.

IMPORTANT:
- User is giving navigation commands for a chess app
- Possible keywords: setting, analyze, scan, lesson, play
- Listen carefully, especially for "setting" (not "cycling", "sitting", or other words)
- Provide ONLY the transcription text without additional explanations
- Do NOT add "Listening" at the beginning

Transcription:`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: audioBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        },
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        const transcription = data.candidates[0].content.parts[0].text.trim();

        return {
          text: transcription,
          confidence: 0.9,
          success: true,
        };
      } else {
        throw new Error("No transcription generated");
      }
    } catch (error) {
      console.error("Gemini transcription error:", error);
      return {
        text: "",
        confidence: 0,
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  setLanguage(language: string): void {
    this.language = language;
  }
}
