import React from "react";
import Svg, { Circle, Rect, Path, G, Line } from "react-native-svg";

export const VoiceOffIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#F5F5F5" />
      <G transform="translate(14, 8)">
        <Rect x="7" y="2" width="6" height="12" rx="3" fill="#9E9E9E" />
        <Path
          d="M4 10 Q4 16 10 16 Q16 16 16 10"
          stroke="#9E9E9E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Path d="M10 16 L10 20" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" />
        <Path d="M6 20 L14 20" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" />
        <Line x1="2" y1="2" x2="18" y2="20" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />
      </G>
    </Svg>
  );
};
