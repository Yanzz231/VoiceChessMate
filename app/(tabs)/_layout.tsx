import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_STORAGE_KEYS } from '@/constants/storageKeys';
import { WCAGColors } from '@/constants/wcagColors';
import { speak } from '@/utils/speechUtils';

// Icons
import { HomeIcon } from '@/components/icons/tabs/HomeIcon';
import { PlayIcon } from '@/components/icons/tabs/PlayIcon';
import { ScanIcon } from '@/components/icons/tabs/ScanIcon';
import { AnalyzeIcon } from '@/components/icons/tabs/AnalyzeIcon';
import { SettingsIcon } from '@/components/icons/tabs/SettingsIcon';

export default function TabLayout() {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const profileData = await AsyncStorage.getItem(USER_STORAGE_KEYS.PROFILE);
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    };
    loadUserProfile();
  }, []);

  const handleTabPress = (tabName: string) => {
    speak(tabName);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: WCAGColors.neutral.white,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: WCAGColors.primary.yellow,
        tabBarInactiveTintColor: WCAGColors.neutral.gray500,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            accessible={true}
            accessibilityRole="button"
            onPress={(e) => {
              props.onPress && props.onPress(e);
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon size={28} color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Learn. Navigate to lessons and learning path',
        }}
        listeners={{
          tabPress: () => handleTabPress('Learn'),
        }}
      />

      <Tabs.Screen
        name="play"
        options={{
          title: 'Play AI',
          tabBarIcon: ({ color, focused }) => (
            <PlayIcon size={28} color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Play with AI. Start a chess game against computer',
        }}
        listeners={{
          tabPress: () => handleTabPress('Play with AI'),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: WCAGColors.primary.yellow,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -30,
                shadowColor: WCAGColors.primary.yellow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <ScanIcon size={32} color={WCAGColors.neutral.white} focused={true} />
            </View>
          ),
          tabBarAccessibilityLabel: 'Scan. Open camera to scan chess position',
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: () => handleTabPress('Scan'),
        }}
      />

      <Tabs.Screen
        name="analyze"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ color, focused }) => (
            <AnalyzeIcon size={28} color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Analyze. Analyze your chess games',
        }}
        listeners={{
          tabPress: () => handleTabPress('Analyze'),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <SettingsIcon size={28} color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Settings. App settings and preferences',
        }}
        listeners={{
          tabPress: () => handleTabPress('Settings'),
        }}
      />
    </Tabs>
  );
}
