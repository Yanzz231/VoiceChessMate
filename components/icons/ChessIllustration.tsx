import React from "react";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

export const ChessIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 280,
  height = 220,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      {/* Chess Board Base */}
      <G>
        {/* Board shadow */}
        <Ellipse
          cx="140"
          cy="200"
          rx="100"
          ry="12"
          fill="#4A90E2"
          opacity="0.2"
        />

        {/* Board */}
        <Rect
          x="50"
          y="120"
          width="180"
          height="180"
          rx="12"
          transform="rotate(-5 140 210)"
          fill="#E68A00"
        />
        <Rect
          x="60"
          y="130"
          width="160"
          height="160"
          rx="8"
          transform="rotate(-5 140 210)"
          fill="#FFF8E7"
        />

        {/* Chess squares pattern */}
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const isBlack = (row + col) % 2 === 1;
            if (!isBlack) return null;
            return (
              <Rect
                key={`square-${row}-${col}`}
                x={70 + col * 35}
                y={140 + row * 35}
                width="35"
                height="35"
                fill="#4A90E2"
                opacity="0.3"
                transform="rotate(-5 140 210)"
              />
            );
          })
        )}
      </G>

      {/* Chess Pieces */}
      <G>
        {/* King (left) */}
        <G transform="translate(70, 40)">
          {/* Crown */}
          <Path
            d="M20 25 L15 15 L20 18 L25 10 L30 18 L35 15 L30 25 Z"
            fill="#F5A623"
            stroke="#E68A00"
            strokeWidth="2"
          />
          {/* Head */}
          <Circle cx="25" cy="35" r="12" fill="#F5A623" stroke="#E68A00" strokeWidth="2" />
          {/* Body */}
          <Path
            d="M15 47 Q25 42 35 47 L32 70 Q25 72 18 70 Z"
            fill="#F5A623"
            stroke="#E68A00"
            strokeWidth="2"
          />
          {/* Base */}
          <Ellipse cx="25" cy="72" rx="14" ry="4" fill="#E68A00" />
        </G>

        {/* Queen (right) */}
        <G transform="translate(170, 50)">
          {/* Crown */}
          <Circle cx="18" cy="15" r="3" fill="#4A90E2" />
          <Circle cx="25" cy="12" r="4" fill="#4A90E2" />
          <Circle cx="32" cy="15" r="3" fill="#4A90E2" />
          <Path
            d="M15 20 L20 18 L25 15 L30 18 L35 20 L32 28 L18 28 Z"
            fill="#4A90E2"
            stroke="#2E5C8A"
            strokeWidth="2"
          />
          {/* Head */}
          <Circle cx="25" cy="35" r="10" fill="#4A90E2" stroke="#2E5C8A" strokeWidth="2" />
          {/* Body */}
          <Path
            d="M17 45 Q25 42 33 45 L30 65 Q25 67 20 65 Z"
            fill="#4A90E2"
            stroke="#2E5C8A"
            strokeWidth="2"
          />
          {/* Base */}
          <Ellipse cx="25" cy="67" rx="12" ry="3.5" fill="#2E5C8A" />
        </G>

        {/* Pawn (center-left) */}
        <G transform="translate(110, 80)">
          {/* Head */}
          <Circle cx="25" cy="20" r="8" fill="#FFC857" stroke="#E68A00" strokeWidth="2" />
          {/* Body */}
          <Path
            d="M20 28 Q25 26 30 28 L28 45 Q25 46 22 45 Z"
            fill="#FFC857"
            stroke="#E68A00"
            strokeWidth="2"
          />
          {/* Base */}
          <Ellipse cx="25" cy="47" rx="10" ry="3" fill="#E68A00" />
        </G>

        {/* Knight (center-right) */}
        <G transform="translate(145, 85)">
          {/* Horse head silhouette */}
          <Path
            d="M25 15 Q30 12 32 18 L35 25 Q33 30 30 32 L28 35 Q25 38 20 35 L18 30 Q20 25 22 20 Z"
            fill="#7FB3F0"
            stroke="#2E5C8A"
            strokeWidth="2"
          />
          {/* Ear */}
          <Path d="M28 18 L30 15 L31 20 Z" fill="#4A90E2" />
          {/* Eye */}
          <Circle cx="27" cy="22" r="1.5" fill="#2E5C8A" />
          {/* Base */}
          <Rect
            x="18"
            y="35"
            width="14"
            height="8"
            rx="2"
            fill="#7FB3F0"
            stroke="#2E5C8A"
            strokeWidth="2"
          />
          <Ellipse cx="25" cy="43" rx="9" ry="2.5" fill="#2E5C8A" />
        </G>
      </G>

      {/* Decorative stars/sparkles */}
      <G opacity="0.6">
        <Path d="M35 30 L37 35 L42 37 L37 39 L35 44 L33 39 L28 37 L33 35 Z" fill="#FFC857" />
        <Path d="M220 45 L222 50 L227 52 L222 54 L220 59 L218 54 L213 52 L218 50 Z" fill="#F5A623" />
        <Path d="M245 85 L246 88 L249 89 L246 90 L245 93 L244 90 L241 89 L244 88 Z" fill="#7FB3F0" />
        <Path d="M25 100 L26 103 L29 104 L26 105 L25 108 L24 105 L21 104 L24 103 Z" fill="#4A90E2" />
      </G>
    </Svg>
  );
};
