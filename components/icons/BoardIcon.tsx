import React from "react";
import Svg, { Rect, Line } from "react-native-svg";

interface BoardIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const BoardIcon: React.FC<BoardIconProps> = ({
  width = 24,
  height = 24,
  color = "#000000",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" stroke={color} strokeWidth="2" rx="2" />
      <Line x1="9" y1="3" x2="9" y2="21" stroke={color} strokeWidth="1.5" />
      <Line x1="15" y1="3" x2="15" y2="21" stroke={color} strokeWidth="1.5" />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5" />
      <Line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
};
