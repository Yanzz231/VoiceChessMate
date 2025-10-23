// Common misheard words correction
export const correctSpeechErrors = (text: string): string => {
  const corrections: Record<string, string> = {
    // Setting variations (most common misheard)
    cycling: "setting",
    citilink: "setting",
    setlink: "setting",
    settling: "setting",
    seting: "setting",
    settings: "setting",
    sating: "setting",
    sitting: "setting",
    citing: "setting",
    sightseeing: "setting",
    ceiling: "setting",

    // Analyze variations
    analisis: "analisis",
    analis: "analisis",
    analisa: "analisis",
    analysis: "analisis",

    // Scan variations
    skan: "scan",
    scan: "scan",

    // Lesson variations
    leson: "lesson",
    lesion: "lesson",

    // Play variations
    main: "main",
    men: "main",

    // Common Indonesian phrases
    "ke setting": "setting",
    "ke cycling": "setting",
    "ke citilink": "setting",
    "buka setting": "setting",
    "buka cycling": "setting",
    "buka citilink": "setting",
    "mau ke setting": "setting",
    "mau ke cycling": "setting",
    "mau ke citilink": "setting",
    "ke pengaturan": "pengaturan",
    "buka pengaturan": "pengaturan",
    "mau ke pengaturan": "pengaturan",

    // Remove "Listening" prefix
    listening: "",
    "listening.": "",
  };

  let corrected = text.toLowerCase();

  // Remove "Listening" prefix first
  corrected = corrected
    .replace(/^listening\.?\s*/i, "")
    .replace(/^mendengarkan\.?\s*/i, "")
    .trim();

  // Check for exact phrase matches
  for (const [wrong, right] of Object.entries(corrections)) {
    if (corrected.includes(wrong)) {
      console.log(`Speech correction: "${wrong}" → "${right}"`);
      corrected = corrected.replace(new RegExp(wrong, "gi"), right);
    }
  }

  return corrected.trim();
};

// Calculate Levenshtein distance for fuzzy matching
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Find closest match from a list of valid words
export const findClosestMatch = (
  word: string,
  validWords: string[],
  threshold: number = 2
): string | null => {
  let closest: string | null = null;
  let minDistance = Infinity;

  for (const validWord of validWords) {
    const distance = levenshteinDistance(word.toLowerCase(), validWord.toLowerCase());
    if (distance < minDistance && distance <= threshold) {
      minDistance = distance;
      closest = validWord;
    }
  }

  return closest;
};

// Smart correction for common screen names
export const correctScreenName = (text: string): string => {
  const validScreens = ["setting", "analyze", "scan", "lesson", "play"];
  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    const closest = findClosestMatch(word, validScreens, 2);
    if (closest) {
      console.log(`Fuzzy match: "${word}" → "${closest}"`);
      return closest;
    }
  }

  return text;
};
