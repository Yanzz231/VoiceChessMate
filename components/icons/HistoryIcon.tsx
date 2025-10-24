import React from "react";
import Svg, { Path, Rect, Line } from "react-native-svg";

interface HistoryIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const HistoryIcon: React.FC<HistoryIconProps> = ({
  width = 24,
  height = 24,
  color = "#000000",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Line x1="8" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="8" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="8" y1="18" x2="20" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Rect x="4" y="5" width="2" height="2" rx="1" fill={color} />
      <Rect x="4" y="11" width="2" height="2" rx="1" fill={color} />
      <Rect x="4" y="17" width="2" height="2" rx="1" fill={color} />
    </Svg>
  );
};
