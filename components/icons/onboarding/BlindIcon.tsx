import React from "react";
import Svg, { Circle, Path, G, Rect, Line, Ellipse } from "react-native-svg";

export const BlindIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#FFE8E8" />
      <G transform="translate(14, 7)">
        {/* Head */}
        <Circle cx="10" cy="9" r="7" fill="#FFDAB3" />

        {/* Hair */}
        <Path
          d="M3.5 9 Q3.5 2.5 10 2.5 Q16.5 2.5 16.5 9"
          fill="#6D4C41"
        />

        {/* Sunglasses - dark */}
        <G>
          {/* Left lens - dark */}
          <Ellipse cx="7" cy="9" rx="2.5" ry="2" fill="#2C3E50" />

          {/* Right lens - dark */}
          <Ellipse cx="13" cy="9" rx="2.5" ry="2" fill="#2C3E50" />

          {/* Frame */}
          <Path d="M9.5 9 L10.5 9" stroke="#1A252F" strokeWidth="1.2" />
          <Path d="M4.5 9 L3 9.5" stroke="#1A252F" strokeWidth="1.2" strokeLinecap="round" />
          <Path d="M15.5 9 L17 9.5" stroke="#1A252F" strokeWidth="1.2" strokeLinecap="round" />
        </G>

        {/* Neutral mouth */}
        <Path
          d="M7.5 12.5 L12.5 12.5"
          stroke="#E74C3C"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Body */}
        <Path
          d="M5 17 L4 21 Q4 22 5 22 L5 30 Q5 31 6 31 L14 31 Q15 31 15 30 L15 22 Q16 22 16 21 L15 17 Z"
          fill="#E74C3C"
        />

        {/* Arms */}
        <Path d="M4 18 L1 24 Q1 25 2 25 L4 22" fill="#FFDAB3" />

        {/* Right arm holding cane */}
        <Path d="M16 18 L19 24 Q19 25 18 25 L16 22" fill="#FFDAB3" />

        {/* White cane */}
        <Line x1="18" y1="25" x2="18" y2="37" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="16" y1="37" x2="20" y2="37" stroke="#E74C3C" strokeWidth="1.8" strokeLinecap="round" />

        {/* Legs */}
        <Rect x="6.5" y="31" width="2.8" height="6" rx="1" fill="#C0392B" />
        <Rect x="10.7" y="31" width="2.8" height="6" rx="1" fill="#C0392B" />
      </G>
    </Svg>
  );
};
