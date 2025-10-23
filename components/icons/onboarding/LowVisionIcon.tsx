import React from "react";
import Svg, { Circle, Path, G, Rect, Ellipse } from "react-native-svg";

export const LowVisionIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#FFF8E7" />
      <G transform="translate(14, 7)">
        {/* Head */}
        <Circle cx="10" cy="9" r="7" fill="#FFDAB3" />

        {/* Hair */}
        <Path
          d="M3.5 9 Q3.5 2.5 10 2.5 Q16.5 2.5 16.5 9"
          fill="#6D4C41"
        />

        {/* Glasses frame */}
        <G>
          {/* Left lens */}
          <Circle cx="7" cy="9" r="2.2" fill="none" stroke="#F5A623" strokeWidth="1.5" />
          <Circle cx="7" cy="9" r="1.3" fill="#FFC857" opacity="0.3" />

          {/* Right lens */}
          <Circle cx="13" cy="9" r="2.2" fill="none" stroke="#F5A623" strokeWidth="1.5" />
          <Circle cx="13" cy="9" r="1.3" fill="#FFC857" opacity="0.3" />

          {/* Bridge */}
          <Path d="M9.2 9 L10.8 9" stroke="#F5A623" strokeWidth="1.5" />

          {/* Temples */}
          <Path d="M4.8 9 L3 9.5" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M15.2 9 L17 9.5" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
        </G>

        {/* Eyes behind glasses */}
        <Circle cx="7" cy="9" r="0.8" fill="#2C1810" />
        <Circle cx="13" cy="9" r="0.8" fill="#2C1810" />
        <Circle cx="7.3" cy="8.7" r="0.3" fill="#FFF" />
        <Circle cx="13.3" cy="8.7" r="0.3" fill="#FFF" />

        {/* Smile */}
        <Path
          d="M7 12 Q10 13.5 13 12"
          stroke="#F5A623"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body */}
        <Path
          d="M5 17 L4 21 Q4 22 5 22 L5 30 Q5 31 6 31 L14 31 Q15 31 15 30 L15 22 Q16 22 16 21 L15 17 Z"
          fill="#F5A623"
        />

        {/* Arms */}
        <Path d="M4 18 L1 24 Q1 25 2 25 L4 22" fill="#FFDAB3" />
        <Path d="M16 18 L19 24 Q19 25 18 25 L16 22" fill="#FFDAB3" />

        {/* Legs */}
        <Rect x="6.5" y="31" width="2.8" height="6" rx="1" fill="#E68A00" />
        <Rect x="10.7" y="31" width="2.8" height="6" rx="1" fill="#E68A00" />
      </G>
    </Svg>
  );
};
