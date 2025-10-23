import React from "react";
import Svg, { Circle, Path, G, Rect } from "react-native-svg";

export const TeenIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#E8F4FD" />
      <G transform="translate(14, 7)">
        {/* Head */}
        <Circle cx="10" cy="9" r="7" fill="#FFD5B3" />

        {/* Hair - longer teen style */}
        <Path
          d="M3.5 9 Q3.5 2 10 2 Q16.5 2 16.5 9 L15 10 Q10 3.5 5 10 Z"
          fill="#3D2817"
        />

        {/* Eyes */}
        <Circle cx="7" cy="9" r="1.4" fill="#2C1810" />
        <Circle cx="13" cy="9" r="1.4" fill="#2C1810" />
        <Circle cx="7.5" cy="8.6" r="0.6" fill="#FFF" />
        <Circle cx="13.5" cy="8.6" r="0.6" fill="#FFF" />

        {/* Smile */}
        <Path
          d="M7 12 Q10 13.5 13 12"
          stroke="#FF6B6B"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body - Hoodie */}
        <Path
          d="M5 17 L4 21 Q4 22 5 22 L5 30 Q5 31 6 31 L14 31 Q15 31 15 30 L15 22 Q16 22 16 21 L15 17 Z"
          fill="#4A90E2"
        />

        {/* Hood strings */}
        <Circle cx="8.5" cy="18" r="0.8" fill="#7FB3F0" />
        <Circle cx="11.5" cy="18" r="0.8" fill="#7FB3F0" />

        {/* Arms */}
        <Path d="M4 18 L1 24 Q1 25 2 25 L4 22" fill="#FFD5B3" />
        <Path d="M16 18 L19 24 Q19 25 18 25 L16 22" fill="#FFD5B3" />

        {/* Legs */}
        <Rect x="6.5" y="31" width="2.8" height="6" rx="1" fill="#2C3E50" />
        <Rect x="10.7" y="31" width="2.8" height="6" rx="1" fill="#2C3E50" />
      </G>
    </Svg>
  );
};
