import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_STORAGE_KEYS } from '@/constants/storageKeys';
import { WCAGColors, AccessibilitySizes } from '@/constants/wcagColors';
import { speak } from '@/utils/speechUtils';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface LessonNode {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'practice' | 'test' | 'bonus';
  locked: boolean;
  completed: boolean;
  stars: number;
  position: 'left' | 'center' | 'right';
}

const LESSON_PATH: LessonNode[] = [
  {
    id: '1',
    title: 'Introduction to Chess',
    description: 'Learn the basics of chess pieces',
    type: 'lesson',
    locked: false,
    completed: true,
    stars: 3,
    position: 'center',
  },
  {
    id: '2',
    title: 'How Pieces Move',
    description: 'Master piece movements',
    type: 'lesson',
    locked: false,
    completed: true,
    stars: 2,
    position: 'right',
  },
  {
    id: '3',
    title: 'Practice: Basic Moves',
    description: 'Test your knowledge',
    type: 'practice',
    locked: false,
    completed: false,
    stars: 0,
    position: 'left',
  },
  {
    id: '4',
    title: 'Opening Principles',
    description: 'Learn how to start a game',
    type: 'lesson',
    locked: false,
    completed: false,
    stars: 0,
    position: 'center',
  },
  {
    id: '5',
    title: 'Common Openings',
    description: 'Popular chess openings',
    type: 'lesson',
    locked: true,
    completed: false,
    stars: 0,
    position: 'right',
  },
  {
    id: '6',
    title: 'Test: Opening Knowledge',
    description: 'Check your understanding',
    type: 'test',
    locked: true,
    completed: false,
    stars: 0,
    position: 'center',
  },
  {
    id: '7',
    title: 'Middle Game Tactics',
    description: 'Tactical patterns',
    type: 'lesson',
    locked: true,
    completed: false,
    stars: 0,
    position: 'left',
  },
  {
    id: '8',
    title: 'Bonus: Chess Puzzles',
    description: 'Fun chess challenges',
    type: 'bonus',
    locked: true,
    completed: false,
    stars: 0,
    position: 'center',
  },
];

const LessonNodeIcon = ({ type, locked }: { type: string; locked: boolean }) => {
  const color = locked ? WCAGColors.neutral.gray400 : WCAGColors.primary.yellow;

  if (type === 'lesson') {
    return (
      <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (type === 'practice') {
    return (
      <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 11L12 14L22 4"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 20V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (type === 'test') {
    return (
      <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 8V12L15 15"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // bonus
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const StarDisplay = ({ stars }: { stars: number }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3].map((star) => (
        <Svg key={star} width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={star <= stars ? WCAGColors.primary.yellow : WCAGColors.neutral.gray300}
            stroke={star <= stars ? WCAGColors.primary.yellow : WCAGColors.neutral.gray300}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ))}
    </View>
  );
};

export default function LearnScreen() {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const profileData = await AsyncStorage.getItem(USER_STORAGE_KEYS.PROFILE);
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    };
    loadUserProfile();

    speak('Learn. Your chess learning path.');
  }, []);

  const handleLessonPress = (lesson: LessonNode) => {
    if (lesson.locked) {
      speak(`${lesson.title}. Locked. Complete previous lessons to unlock.`);
      return;
    }

    speak(`${lesson.title}. ${lesson.description}.`);
  };

  const getNodeBackgroundColor = (lesson: LessonNode) => {
    if (lesson.locked) return WCAGColors.neutral.gray200;
    if (lesson.completed) return WCAGColors.semantic.success;
    if (lesson.type === 'bonus') return WCAGColors.primary.yellowDark;
    return WCAGColors.primary.yellow;
  };

  const getPositionStyle = (position: string, index: number) => {
    const baseLeft = width / 2 - 40;
    if (position === 'left') return { left: baseLeft - 80 };
    if (position === 'right') return { left: baseLeft + 80 };
    return { left: baseLeft };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WCAGColors.neutral.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={WCAGColors.neutral.white} />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: AccessibilitySizes.spacing.lg,
          paddingVertical: AccessibilitySizes.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: WCAGColors.neutral.gray200,
        }}
      >
        <Text
          style={{
            fontSize: AccessibilitySizes.text.xl,
            fontWeight: AccessibilitySizes.fontWeight.bold,
            color: WCAGColors.neutral.gray900,
          }}
        >
          Your Learning Path
        </Text>
        <Text
          style={{
            fontSize: AccessibilitySizes.text.sm,
            color: WCAGColors.neutral.gray600,
            marginTop: 4,
          }}
        >
          Master chess step by step
        </Text>
      </View>

      {/* Lesson Path */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: AccessibilitySizes.spacing.xl,
          paddingHorizontal: AccessibilitySizes.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ position: 'relative', minHeight: 800 }}>
          {/* Path Line */}
          <View
            style={{
              position: 'absolute',
              left: width / 2 - 2,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: WCAGColors.neutral.gray300,
            }}
          />

          {/* Lesson Nodes */}
          {LESSON_PATH.map((lesson, index) => (
            <View
              key={lesson.id}
              style={{
                position: 'relative',
                marginBottom: AccessibilitySizes.spacing.xxl,
              }}
            >
              <TouchableOpacity
                onPress={() => handleLessonPress(lesson)}
                activeOpacity={lesson.locked ? 1 : 0.7}
                style={{
                  position: 'absolute',
                  ...getPositionStyle(lesson.position, index),
                  alignItems: 'center',
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${lesson.title}. ${lesson.description}. ${
                  lesson.locked ? 'Locked' : lesson.completed ? 'Completed' : 'Available'
                }`}
                accessibilityHint={
                  lesson.locked
                    ? 'Complete previous lessons to unlock'
                    : 'Double tap to start lesson'
                }
              >
                {/* Lesson Node Circle */}
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: getNodeBackgroundColor(lesson),
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: lesson.locked ? 0.1 : 0.25,
                    shadowRadius: 8,
                    elevation: lesson.locked ? 2 : 6,
                    borderWidth: 4,
                    borderColor: WCAGColors.neutral.white,
                  }}
                >
                  <LessonNodeIcon type={lesson.type} locked={lesson.locked} />
                </View>

                {/* Lesson Info Card */}
                <View
                  style={{
                    marginTop: 12,
                    backgroundColor: WCAGColors.neutral.white,
                    borderRadius: 12,
                    padding: AccessibilitySizes.spacing.md,
                    minWidth: 160,
                    maxWidth: 200,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 2,
                    borderColor: lesson.locked
                      ? WCAGColors.neutral.gray300
                      : WCAGColors.primary.yellow,
                  }}
                >
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.sm,
                      fontWeight: AccessibilitySizes.fontWeight.bold,
                      color: lesson.locked
                        ? WCAGColors.neutral.gray500
                        : WCAGColors.neutral.gray900,
                      textAlign: 'center',
                      marginBottom: 4,
                    }}
                  >
                    {lesson.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: AccessibilitySizes.text.xs,
                      color: WCAGColors.neutral.gray600,
                      textAlign: 'center',
                      marginBottom: lesson.completed ? 8 : 0,
                    }}
                  >
                    {lesson.description}
                  </Text>

                  {/* Stars for completed lessons */}
                  {lesson.completed && (
                    <View style={{ alignItems: 'center' }}>
                      <StarDisplay stars={lesson.stars} />
                    </View>
                  )}

                  {/* Lock indicator */}
                  {lesson.locked && (
                    <View
                      style={{
                        marginTop: 8,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        backgroundColor: WCAGColors.neutral.gray100,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: AccessibilitySizes.text.xs,
                          color: WCAGColors.neutral.gray600,
                          fontWeight: AccessibilitySizes.fontWeight.semibold,
                        }}
                      >
                        Locked
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
