import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import { ModernOptionCard } from '@/components/onboarding/ModernOptionCard';
import { DuolingoProgressBar } from '@/components/onboarding/DuolingoProgressBar';
import { WelcomeHandIcon } from '@/components/icons/WelcomeIcon';
import { ChildIcon } from '@/components/icons/onboarding/ChildIcon';
import { TeenIcon } from '@/components/icons/onboarding/TeenIcon';
import { AdultIcon } from '@/components/icons/onboarding/AdultIcon';
import { EyeHealthyIcon } from '@/components/icons/onboarding/EyeHealthyIcon';
import { LowVisionIcon } from '@/components/icons/onboarding/LowVisionIcon';
import { BlindIcon } from '@/components/icons/onboarding/BlindIcon';
import { ColorBlindIcon } from '@/components/icons/onboarding/ColorBlindIcon';
import { VoiceIcon } from '@/components/icons/onboarding/VoiceIcon';
import { VoiceOffIcon } from '@/components/icons/onboarding/VoiceOffIcon';
import { ExitConfirmModal } from '@/components/modals/ExitConfirmModal';
import { USER_STORAGE_KEYS } from '@/constants/storageKeys';
import { UserProfile, defaultUserProfile } from '@/types/userProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import { speak } from '@/utils/speechUtils';

type OnboardingStep = 'welcome' | 'age' | 'visual_impairment' | 'voice_mode';

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [age, setAge] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const backPressCount = useRef(0);
  const backPressTimer = useRef<any>(null);

  useEffect(() => {
    const loadVoiceMode = async () => {
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      setVoiceModeEnabled(voiceMode === 'true');
    };
    loadVoiceMode();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [currentStep]);

  const handleBackPress = (): boolean => {
    if (currentStep === 'welcome') {
      backPressCount.current += 1;

      if (backPressCount.current === 1) {
        if (backPressTimer.current) clearTimeout(backPressTimer.current);

        backPressTimer.current = setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);

        return true;
      } else if (backPressCount.current === 2) {
        if (backPressTimer.current) clearTimeout(backPressTimer.current);
        backPressCount.current = 0;
        setShowExitModal(true);
        return true;
      }
    } else {
      handleBack();
      return true;
    }
    return false;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    await AsyncStorage.setItem(USER_STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
  };

  const saveProfileAndContinue = async () => {
    const finalProfile: UserProfile = {
      ...userProfile,
      onboardingCompleted: true,
    };

    await AsyncStorage.setItem(USER_STORAGE_KEYS.PROFILE, JSON.stringify(finalProfile));
    await AsyncStorage.setItem(USER_STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    await AsyncStorage.setItem(
      USER_STORAGE_KEYS.VOICE_MODE,
      finalProfile.voiceModeEnabled.toString()
    );

    router.replace('/login');
  };

  const handleAgeNext = () => {
    const ageNum = parseInt(age);
    if (ageNum > 0) {
      let ageGroup: 'child' | 'teen' | 'adult' = 'adult';
      if (ageNum < 13) ageGroup = 'child';
      else if (ageNum < 18) ageGroup = 'teen';

      updateProfile({ age: ageNum, ageGroup });
      setCurrentStep('visual_impairment');
    }
  };

  const getStepNumber = (): number => {
    const steps: OnboardingStep[] = ['welcome', 'age', 'visual_impairment', 'voice_mode'];
    return steps.indexOf(currentStep);
  };

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'age':
        return userProfile.ageGroup !== null;
      case 'visual_impairment':
        return userProfile.visualImpairmentType !== null && userProfile.visualImpairmentType !== undefined;
      case 'voice_mode':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    speak(currentStep === 'voice_mode' ? 'Finish' : 'Continue');
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('age');
        setTimeout(() => speak("What's your age group? We'll personalize your experience. Please select your age group."), 500);
        break;
      case 'age':
        handleAgeNext();
        setTimeout(() => speak("Accessibility Options. Do you have any visual impairments? Please select your accessibility needs."), 500);
        break;
      case 'visual_impairment':
        setCurrentStep('voice_mode');
        setTimeout(() => speak("Voice Mode. Voice Mode will read out button labels when you tap them. Please choose if you want to enable voice mode."), 500);
        break;
      case 'voice_mode':
        saveProfileAndContinue();
        break;
    }
  };

  const handleBack = () => {
    speak('Back');
    switch (currentStep) {
      case 'age':
        setCurrentStep('welcome');
        break;
      case 'visual_impairment':
        setCurrentStep('age');
        break;
      case 'voice_mode':
        setCurrentStep('visual_impairment');
        break;
    }
  };

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  return (
    <View style={{ flex: 1, backgroundColor: WCAGColors.neutral.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={WCAGColors.neutral.white} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Progress */}
        <View
          style={{
            paddingHorizontal: AccessibilitySizes.spacing.lg,
            paddingTop: AccessibilitySizes.spacing.sm,
            paddingBottom: AccessibilitySizes.spacing.md,
          }}
        >
          <DuolingoProgressBar currentStep={getStepNumber()} totalSteps={4} />
        </View>

      {/* Content Area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: AccessibilitySizes.spacing.lg,
          paddingBottom: AccessibilitySizes.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <WelcomeHandIcon width={140} height={140} />

            <TouchableOpacity
              onPress={() => speak('Welcome to ChessMate! ChessMate is designed for everyone, including children and people with visual impairments.')}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.xxxl,
                  fontWeight: AccessibilitySizes.fontWeight.extrabold,
                  color: WCAGColors.neutral.gray900,
                  textAlign: 'center',
                  marginTop: AccessibilitySizes.spacing.xl,
                  marginBottom: AccessibilitySizes.spacing.sm,
                }}
              >
                Welcome to ChessMate!
              </Text>

              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.normal,
                  color: WCAGColors.neutral.gray600,
                  textAlign: 'center',
                  lineHeight: 22,
                  paddingHorizontal: AccessibilitySizes.spacing.md,
                }}
              >
                ChessMate is designed for everyone, including children and people with visual impairments.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Age Step */}
        {currentStep === 'age' && (
          <View style={{ flex: 1, paddingTop: AccessibilitySizes.spacing.xl }}>
            <TouchableOpacity
              onPress={() => speak("What's your age group? We'll personalize your experience")}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.xxl,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.gray900,
                  textAlign: 'center',
                  marginBottom: AccessibilitySizes.spacing.sm,
                }}
              >
                What's your age group?
              </Text>

              <Text
                style={{
                  fontSize: AccessibilitySizes.text.sm,
                  fontWeight: AccessibilitySizes.fontWeight.normal,
                  color: WCAGColors.neutral.gray600,
                  textAlign: 'center',
                  marginBottom: AccessibilitySizes.spacing.xl,
                }}
              >
                We'll personalize your experience
              </Text>
            </TouchableOpacity>

            <ModernOptionCard
              icon={<ChildIcon size={52} />}
              title="Child"
              description="Under 13 years old"
              selected={userProfile.ageGroup === 'child'}
              onPress={() => {
                setAge('10');
                updateProfile({ age: 10, ageGroup: 'child' });
              }}
            />

            <ModernOptionCard
              icon={<TeenIcon size={52} />}
              title="Teen"
              description="13-17 years old"
              selected={userProfile.ageGroup === 'teen'}
              onPress={() => {
                setAge('15');
                updateProfile({ age: 15, ageGroup: 'teen' });
              }}
            />

            <ModernOptionCard
              icon={<AdultIcon size={52} />}
              title="Adult"
              description="18 years and above"
              selected={userProfile.ageGroup === 'adult'}
              onPress={() => {
                setAge('25');
                updateProfile({ age: 25, ageGroup: 'adult' });
              }}
            />
          </View>
        )}

        {/* Visual Impairment Step */}
        {currentStep === 'visual_impairment' && (
          <View style={{ flex: 1, paddingTop: AccessibilitySizes.spacing.xl }}>
            <TouchableOpacity
              onPress={() => speak('Accessibility Options. Do you have any visual impairments?')}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.xxl,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.gray900,
                  textAlign: 'center',
                  marginBottom: AccessibilitySizes.spacing.sm,
                }}
              >
                Accessibility Options
              </Text>

              <Text
                style={{
                  fontSize: AccessibilitySizes.text.sm,
                  fontWeight: AccessibilitySizes.fontWeight.normal,
                  color: WCAGColors.neutral.gray600,
                  textAlign: 'center',
                  marginBottom: AccessibilitySizes.spacing.xl,
                }}
              >
                Do you have any visual impairments?
              </Text>
            </TouchableOpacity>

            <ModernOptionCard
              icon={<EyeHealthyIcon size={52} />}
              title="No Visual Impairment"
              description="I can see the screen clearly"
              selected={userProfile.visualImpairmentType === 'none'}
              onPress={() => {
                updateProfile({
                  hasVisualImpairment: false,
                  visualImpairmentType: 'none',
                  highContrastMode: false,
                });
              }}
            />

            <ModernOptionCard
              icon={<LowVisionIcon size={52} />}
              title="Low Vision"
              description="I have difficulty seeing details"
              selected={userProfile.visualImpairmentType === 'low_vision'}
              onPress={() => {
                updateProfile({
                  hasVisualImpairment: true,
                  visualImpairmentType: 'low_vision',
                  highContrastMode: true,
                  preferredFontSize: 'large',
                });
              }}
            />

            <ModernOptionCard
              icon={<BlindIcon size={52} />}
              title="Blind"
              description="I rely on voice feedback"
              selected={userProfile.visualImpairmentType === 'blind'}
              onPress={() => {
                updateProfile({
                  hasVisualImpairment: true,
                  visualImpairmentType: 'blind',
                  highContrastMode: true,
                  preferredFontSize: 'extra_large',
                  voiceModeEnabled: true,
                });
              }}
            />

            <ModernOptionCard
              icon={<ColorBlindIcon size={52} />}
              title="Color Blind"
              description="I have difficulty distinguishing colors"
              selected={userProfile.visualImpairmentType === 'color_blind'}
              onPress={() => {
                updateProfile({
                  hasVisualImpairment: true,
                  visualImpairmentType: 'color_blind',
                  highContrastMode: true,
                });
              }}
            />
          </View>
        )}

        {/* Voice Mode Step */}
        {currentStep === 'voice_mode' && (
          <View style={{ flex: 1, paddingTop: AccessibilitySizes.spacing.xl }}>
            <TouchableOpacity
              onPress={() => speak('Voice Mode. Voice Mode will read out button labels when you tap them')}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.xxl,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.gray900,
                  textAlign: 'center',
                  marginBottom: AccessibilitySizes.spacing.sm,
                }}
              >
                Voice Mode
              </Text>

              <Text
                style={{
                  fontSize: AccessibilitySizes.text.sm,
                  fontWeight: AccessibilitySizes.fontWeight.normal,
                  color: WCAGColors.neutral.gray600,
                  textAlign: 'center',
                  marginBottom: AccessibilitySizes.spacing.xl,
                  lineHeight: 20,
                }}
              >
                Voice Mode will read out button labels when you tap them
              </Text>
            </TouchableOpacity>

            <ModernOptionCard
              icon={<VoiceIcon size={52} />}
              title="Enable Voice Mode"
              description="Hear announcements when tapping"
              selected={userProfile.voiceModeEnabled}
              onPress={() => {
                updateProfile({ voiceModeEnabled: true });
                setVoiceModeEnabled(true);
              }}
            />

            <ModernOptionCard
              icon={<VoiceOffIcon size={52} />}
              title="Disable Voice Mode"
              description="Silent operation"
              selected={!userProfile.voiceModeEnabled}
              onPress={() => {
                updateProfile({ voiceModeEnabled: false });
                setVoiceModeEnabled(false);
              }}
            />
          </View>
        )}

      </ScrollView>

      {/* Bottom Buttons - Duolingo Style */}
      <View
        style={{
          paddingHorizontal: AccessibilitySizes.spacing.lg,
          paddingBottom: AccessibilitySizes.spacing.lg,
          paddingTop: AccessibilitySizes.spacing.md,
          backgroundColor: WCAGColors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: WCAGColors.neutral.gray200,
        }}
      >
          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canGoNext()}
            style={{
              minHeight: AccessibilitySizes.minTouchTargetLarge,
              borderRadius: AccessibilitySizes.radius.lg,
              overflow: 'hidden',
              marginBottom: currentStep !== 'welcome' ? AccessibilitySizes.spacing.sm : 0,
              opacity: canGoNext() ? 1 : 0.5,
            }}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <LinearGradient
              colors={canGoNext() ? [WCAGColors.primary.yellowLight, WCAGColors.primary.yellow] : [WCAGColors.neutral.gray300, WCAGColors.neutral.gray300]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.white,
                }}
              >
                {currentStep === 'voice_mode' ? 'Finish' : 'Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Back Button */}
          {currentStep !== 'welcome' && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                minHeight: AccessibilitySizes.minTouchTargetLarge,
                borderRadius: AccessibilitySizes.radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: WCAGColors.neutral.gray100,
                borderWidth: 2,
                borderColor: WCAGColors.neutral.gray300,
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text
                style={{
                  fontSize: AccessibilitySizes.text.md,
                  fontWeight: AccessibilitySizes.fontWeight.bold,
                  color: WCAGColors.neutral.gray800,
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        visible={showExitModal}
        title="Exit Onboarding?"
        message="Are you sure you want to exit? Your progress will not be saved."
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleExitApp}
      />
    </View>
  );
};

export default OnboardingScreen;
