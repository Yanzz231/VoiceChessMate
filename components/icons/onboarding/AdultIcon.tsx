import React from "react";
import Svg, { Circle, Path, G, Rect } from "react-native-svg";

export const AdultIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#FFF3E0" />
      <G transform="translate(13, 6)">
        {/* Head */}
        <Circle cx="11" cy="10" r="7.5" fill="#FFCB9A" />

        {/* Hair - professional style */}
        <Path
          d="M4 10 Q4 3 11 3 Q18 3 18 10 L17 11"
          fill="#5D4037"
        />

        {/* Eyes */}
        <Circle cx="8" cy="10" r="1.4" fill="#2C1810" />
        <Circle cx="14" cy="10" r="1.4" fill="#2C1810" />
        <Circle cx="8.5" cy="9.6" r="0.6" fill="#FFF" />
        <Circle cx="14.5" cy="9.6" r="0.6" fill="#FFF" />

        {/* Smile */}
        <Path
          d="M8 13 Q11 14.5 14 13"
          stroke="#E68A00"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body - Business casual shirt */}
        <Path
          d="M5 18 L4 22 Q4 23 5 23 L5 32 Q5 33 6 33 L16 33 Q17 33 17 32 L17 23 Q18 23 18 22 L17 18 Z"
          fill="#E68A00"
        />

        {/* Collar */}
        <Path
          d="M9 18 L11 20 L13 18"
          stroke="#C67100"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Arms */}
        <Path d="M4 19 L1 26 Q1 27 2 27 L4 24" fill="#FFCB9A" />
        <Path d="M18 19 L21 26 Q21 27 20 27 L18 24" fill="#FFCB9A" />

        {/* Legs */}
        <Rect x="7" y="33" width="3" height="6" rx="1" fill="#34495E" />
        <Rect x="12" y="33" width="3" height="6" rx="1" fill="#34495E" />
      </G>
    </Svg>
  );
};
