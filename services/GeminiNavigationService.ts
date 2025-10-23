import { correctSpeechErrors, correctScreenName } from "@/utils/speechCorrection";

export interface NavigationResult {
  screen: string;
  confidence: number;
  success: boolean;
  error?: string;
}

export class GeminiNavigationService {
  private apiKey: string;
  private baseUrl: string =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async determineScreen(message: string): Promise<NavigationResult> {
    try {
      let cleanMessage = message
        .toLowerCase()
        .replace("voice active", "")
        .replace("listening", "")
        .trim();

      console.log("Original message:", cleanMessage);

      // Apply speech error corrections
      cleanMessage = correctSpeechErrors(cleanMessage);
      console.log("After correction:", cleanMessage);

      if (cleanMessage.length < 2) {
        return {
          screen: "",
          confidence: 0,
          success: false,
          error: "Message too short",
        };
      }

      const keywordResult = this.keywordMatching(cleanMessage);
      if (keywordResult.confidence >= 0.9) {
        return keywordResult;
      }

      const prompt = `You are a voice navigation system. Analyze the Indonesian/English command and return the exact screen name.

SCREENS & KEYWORDS (check in this exact order):

1. "setting" - ONLY for: pengaturan, setting, setelan, konfigurasi, preferensi, opsi
   Examples: "ke setting", "buka pengaturan", "menu setting"

2. "analyze" - ONLY for: analisis, analisa, review, evaluasi, periksa (related to game analysis)
   Examples: "analisis game", "lihat analisis", "review permainan"

3. "scan" - ONLY for: scan, pindai, kamera, foto, camera
   Examples: "scan papan", "buka kamera", "ambil foto"

4. "lesson" - ONLY for: belajar, pelajaran, tutorial, panduan, materi
   Examples: "belajar catur", "buka pelajaran", "tutorial"

5. "play" - ONLY for: main, bermain, game, play, mulai, start, home
   Examples: "main catur", "mulai game", "ke menu utama"

User said: "${cleanMessage}"

CRITICAL RULES:
- "setting" ≠ "analyze" (completely different!)
- "pengaturan" = setting (NEVER analyze)
- "analisis" = analyze (NEVER setting)
- Respond with ONLY ONE WORD: setting, analyze, scan, lesson, or play
- NO explanations, NO punctuation, just the screen name

Answer:`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
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
        console.warn("Gemini API failed, using keyword fallback");
        return keywordResult;
      }

      const data = await response.json();

      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        const screen = data.candidates[0].content.parts[0].text
          .toLowerCase()
          .trim();

        const validScreens = ["play", "scan", "lesson", "analyze", "setting"];

        if (validScreens.includes(screen)) {
          return {
            screen,
            confidence: 0.95,
            success: true,
          };
        }
      }

      return keywordResult.success ? keywordResult : {
        screen: "",
        confidence: 0,
        success: false,
        error: "Could not determine screen",
      };
    } catch (error) {
      console.error("Gemini navigation error:", error);

      const fallback = this.keywordMatching(message.toLowerCase());
      return fallback.success ? fallback : {
        screen: "",
        confidence: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private keywordMatching(message: string): NavigationResult {
    const msg = message.toLowerCase().trim();

    // Priority order: setting > analyze > scan > lesson > play
    // Check most specific first to avoid conflicts

    // SETTING - Highest priority
    const settingKeywords = [
      "pengaturan",
      "setting",
      "settings",
      "setelan",
      "konfigurasi",
      "konfigurasi aplikasi",
      "atur aplikasi",
      "preferensi",
      "opsi aplikasi",
      "menu setting",
      "ke setting",
      "buka setting",
      "ke pengaturan",
      "buka pengaturan",
    ];
    for (const keyword of settingKeywords) {
      if (msg.includes(keyword)) {
        console.log(`Matched SETTING keyword: ${keyword}`);
        return { screen: "setting", confidence: 1.0, success: true };
      }
    }

    // ANALYZE
    const analyzeKeywords = [
      "analisis",
      "analisa",
      "analyze",
      "analisis game",
      "analisa permainan",
      "review game",
      "periksa game",
      "tinjau",
      "evaluasi",
      "lihat analisis",
      "ke analisis",
      "buka analisis",
    ];
    for (const keyword of analyzeKeywords) {
      if (msg.includes(keyword)) {
        console.log(`Matched ANALYZE keyword: ${keyword}`);
        return { screen: "analyze", confidence: 1.0, success: true };
      }
    }

    // SCAN
    const scanKeywords = [
      "scan",
      "pindai",
      "scan papan",
      "pindai papan",
      "kamera",
      "camera",
      "foto",
      "foto papan",
      "ambil foto",
      "capture",
      "ke scan",
      "buka scan",
      "buka kamera",
    ];
    for (const keyword of scanKeywords) {
      if (msg.includes(keyword)) {
        console.log(`Matched SCAN keyword: ${keyword}`);
        return { screen: "scan", confidence: 1.0, success: true };
      }
    }

    // LESSON
    const lessonKeywords = [
      "belajar",
      "pelajaran",
      "lesson",
      "tutorial",
      "panduan",
      "materi",
      "kursus",
      "belajar catur",
      "pelajaran catur",
      "ke pelajaran",
      "buka pelajaran",
      "ke lesson",
      "buka lesson",
    ];
    for (const keyword of lessonKeywords) {
      if (msg.includes(keyword)) {
        console.log(`Matched LESSON keyword: ${keyword}`);
        return { screen: "lesson", confidence: 1.0, success: true };
      }
    }

    // PLAY - Lowest priority (most generic)
    const playKeywords = [
      "main",
      "bermain",
      "permainan",
      "game",
      "play",
      "mulai",
      "mulai main",
      "start",
      "home",
      "beranda",
      "main catur",
      "bermain catur",
      "ke main",
      "ke play",
      "buka play",
      "menu utama",
    ];
    for (const keyword of playKeywords) {
      if (msg.includes(keyword)) {
        console.log(`Matched PLAY keyword: ${keyword}`);
        return { screen: "play", confidence: 0.9, success: true };
      }
    }

    console.log("No keyword match found");
    return {
      screen: "",
      confidence: 0,
      success: false,
      error: "No matching keywords",
    };
  }
}
