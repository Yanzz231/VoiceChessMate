import React from "react";
import Svg, { Circle, Path, G, Rect } from "react-native-svg";

export const ChildIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="24" fill="#FFF8E7" />
      <G transform="translate(14, 8)">
        {/* Head */}
        <Circle cx="10" cy="9" r="6.5" fill="#FFDAB3" />

        {/* Hair */}
        <Path
          d="M4 9 Q4 3 10 3 Q16 3 16 9"
          fill="#8B4513"
        />

        {/* Eyes */}
        <Circle cx="7.5" cy="8.5" r="1.3" fill="#2C1810" />
        <Circle cx="12.5" cy="8.5" r="1.3" fill="#2C1810" />
        <Circle cx="8" cy="8.2" r="0.5" fill="#FFF" />
        <Circle cx="13" cy="8.2" r="0.5" fill="#FFF" />

        {/* Smile */}
        <Path
          d="M7 11 Q10 13 13 11"
          stroke="#FF6B6B"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body - T-shirt */}
        <Path
          d="M6 16 L5 20 Q5 21 6 21 L6 28 Q6 29 7 29 L13 29 Q14 29 14 28 L14 21 Q15 21 15 20 L14 16 Z"
          fill="#F5A623"
        />

        {/* Arms */}
        <Path d="M5 17 L2 22 Q2 23 3 23 L5 21" fill="#FFDAB3" />
        <Path d="M15 17 L18 22 Q18 23 17 23 L15 21" fill="#FFDAB3" />

        {/* Legs */}
        <Rect x="7" y="29" width="2.5" height="6" rx="1" fill="#4A90E2" />
        <Rect x="10.5" y="29" width="2.5" height="6" rx="1" fill="#4A90E2" />
      </G>
    </Svg>
  );
};
