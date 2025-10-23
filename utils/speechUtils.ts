import * as Speech from 'expo-speech';

export const speak = async (text: string, options?: Speech.SpeechOptions) => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(text, {
      language: 'en-US',
      ...options,
    });
  } catch (error) {
    console.error('Speech error:', error);
  }
};

export const stopSpeech = async () => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
  } catch (error) {
    console.error('Stop speech error:', error);
  }
};
