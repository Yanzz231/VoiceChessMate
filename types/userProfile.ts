export interface UserProfile {
  age: number | null;
  ageGroup: 'child' | 'teen' | 'adult' | null; // Child: <13, Teen: 13-17, Adult: 18+
  hasVisualImpairment: boolean;
  visualImpairmentType: 'none' | 'low_vision' | 'blind' | 'color_blind' | null;
  voiceModeEnabled: boolean;
  preferredFontSize: 'normal' | 'large' | 'extra_large';
  highContrastMode: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

export const defaultUserProfile: UserProfile = {
  age: null,
  ageGroup: null,
  hasVisualImpairment: false,
  visualImpairmentType: null,
  voiceModeEnabled: false,
  preferredFontSize: 'normal',
  highContrastMode: false,
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
};
