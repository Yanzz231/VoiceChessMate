import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
}

export const WelcomeHandIcon: React.FC<IconProps> = ({ width = 120, height = 120 }) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    <Circle cx="60" cy="60" r="55" fill="#FFF8E7" opacity="0.6" />
    <Circle cx="60" cy="60" r="45" fill="#FFC857" opacity="0.4" />
    <Path
      d="M60 25C41.7 25 27 39.7 27 58C27 76.3 41.7 91 60 91C78.3 91 93 76.3 93 58C93 39.7 78.3 25 60 25Z"
      fill="#F5A623"
    />
    <Path
      d="M45 52C47.2 52 49 50.2 49 48C49 45.8 47.2 44 45 44C42.8 44 41 45.8 41 48C41 50.2 42.8 52 45 52Z"
      fill="#424242"
    />
    <Path
      d="M75 52C77.2 52 79 50.2 79 48C79 45.8 77.2 44 75 44C72.8 44 71 45.8 71 48C71 50.2 72.8 52 75 52Z"
      fill="#424242"
    />
    <Path
      d="M60 72C68 72 74 66 74 62H46C46 66 52 72 60 72Z"
      fill="#424242"
    />
    <Path
      d="M35 65L30 70L25 75"
      stroke="#F5A623"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <Path
      d="M85 65L90 70L95 75"
      stroke="#F5A623"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </Svg>
);

export const AgeIcon: React.FC<IconProps> = ({ width = 80, height = 80 }) => (
  <Svg width={width} height={height} viewBox="0 0 80 80" fill="none">
    <Circle cx="40" cy="40" r="38" fill="#E8F4FD" />
    <Path
      d="M40 10C23.4 10 10 23.4 10 40C10 56.6 23.4 70 40 70C56.6 70 70 56.6 70 40C70 23.4 56.6 10 40 10Z"
      fill="#4A90E2"
    />
    <Path
      d="M35 28L35 52"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <Path
      d="M28 35L35 28L42 35"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="53" cy="28" r="6" fill="white" />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({ width = 80, height = 80 }) => (
  <Svg width={width} height={height} viewBox="0 0 80 80" fill="none">
    <Circle cx="40" cy="40" r="38" fill="#FFF8E7" />
    <Path
      d="M40 25C20 25 10 40 10 40C10 40 20 55 40 55C60 55 70 40 70 40C70 40 60 25 40 25Z"
      fill="#F5A623"
    />
    <Circle cx="40" cy="40" r="10" fill="white" />
    <Circle cx="40" cy="40" r="6" fill="#424242" />
    <Circle cx="43" cy="37" r="3" fill="white" />
  </Svg>
);

export const VoiceIcon: React.FC<IconProps> = ({ width = 80, height = 80 }) => (
  <Svg width={width} height={height} viewBox="0 0 80 80" fill="none">
    <Circle cx="40" cy="40" r="38" fill="#E8F4FD" />
    <Rect x="35" y="20" width="10" height="25" rx="5" fill="#4A90E2" />
    <Path
      d="M50 40C50 45.5 45.5 50 40 50C34.5 50 30 45.5 30 40"
      stroke="#4A90E2"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <Path
      d="M40 50L40 60"
      stroke="#4A90E2"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <Path
      d="M30 60L50 60"
      stroke="#4A90E2"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <Path
      d="M20 35C20 35 18 35 18 40C18 45 20 45 20 45"
      stroke="#2E5C8A"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Path
      d="M60 35C60 35 62 35 62 40C62 45 60 45 60 45"
      stroke="#2E5C8A"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

export const CheckmarkIcon: React.FC<IconProps> = ({ width = 28, height = 28 }) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <Circle cx="14" cy="14" r="14" fill="#4A90E2" />
    <Path
      d="M8 14L12 18L20 10"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BigCheckmarkIcon: React.FC<IconProps> = ({ width = 120, height = 120 }) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    <Circle cx="60" cy="60" r="58" fill="#059669" opacity="0.1" />
    <Circle cx="60" cy="60" r="48" fill="#059669" />
    <Path
      d="M35 60L50 75L85 40"
      stroke="white"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
