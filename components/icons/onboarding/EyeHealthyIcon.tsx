import React from "react";
import Svg, { Circle, Path, G, Rect } from "react-native-svg";

export const EyeHealthyIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#E8F9F0" />
      <G transform="translate(14, 7)">
        {/* Head */}
        <Circle cx="10" cy="9" r="7" fill="#FFDAB3" />

        {/* Hair */}
        <Path
          d="M3.5 9 Q3.5 2.5 10 2.5 Q16.5 2.5 16.5 9"
          fill="#6D4C41"
        />

        {/* Eyes - healthy, wide open */}
        <Circle cx="7" cy="9" r="1.6" fill="#2ECC71" />
        <Circle cx="7" cy="9" r="0.9" fill="#000" />
        <Circle cx="7.4" cy="8.6" r="0.4" fill="#FFF" />

        <Circle cx="13" cy="9" r="1.6" fill="#2ECC71" />
        <Circle cx="13" cy="9" r="0.9" fill="#000" />
        <Circle cx="13.4" cy="8.6" r="0.4" fill="#FFF" />

        {/* Smile */}
        <Path
          d="M7 12 Q10 13.5 13 12"
          stroke="#2ECC71"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body */}
        <Path
          d="M5 17 L4 21 Q4 22 5 22 L5 30 Q5 31 6 31 L14 31 Q15 31 15 30 L15 22 Q16 22 16 21 L15 17 Z"
          fill="#2ECC71"
        />

        {/* Arms */}
        <Path d="M4 18 L1 24 Q1 25 2 25 L4 22" fill="#FFDAB3" />
        <Path d="M16 18 L19 24 Q19 25 18 25 L16 22" fill="#FFDAB3" />

        {/* Legs */}
        <Rect x="6.5" y="31" width="2.8" height="6" rx="1" fill="#27AE60" />
        <Rect x="10.7" y="31" width="2.8" height="6" rx="1" fill="#27AE60" />
      </G>
    </Svg>
  );
};
