import React from "react";
import Svg, { Circle, Rect, Path, G } from "react-native-svg";

export const VoiceIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#E8F4FD" />
      <G transform="translate(14, 8)">
        <Rect x="7" y="2" width="6" height="12" rx="3" fill="#4A90E2" />
        <Path
          d="M4 10 Q4 16 10 16 Q16 16 16 10"
          stroke="#4A90E2"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Path d="M10 16 L10 20" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" />
        <Path d="M6 20 L14 20" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" />
        <Path
          d="M1 8 Q0 10 1 12"
          stroke="#7FB3F0"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M19 8 Q20 10 19 12"
          stroke="#7FB3F0"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};
