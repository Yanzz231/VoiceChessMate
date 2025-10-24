import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const speak = async (text: string, options?: Speech.SpeechOptions) => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    const speedStr = await AsyncStorage.getItem('tts_speed');
    const rate = speedStr ? parseFloat(speedStr) : 1.0;

    Speech.speak(text, {
      language: 'en-US',
      rate: rate,
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
