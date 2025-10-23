import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { WCAGColors } from "@/constants/wcagColors";

interface LessonNodeIconProps {
  type: string;
  locked: boolean;
}

export const LessonNodeIcon: React.FC<LessonNodeIconProps> = ({
  type,
  locked,
}) => {
  const color = locked ? WCAGColors.neutral.gray600 : WCAGColors.neutral.white;

  if (type === "lesson") {
    return (
      <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
        />
      </Svg>
    );
  }

  if (type === "practice") {
    return (
      <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 11L12 14L22 4"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 20V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (type === "test") {
    return (
      <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Path
          d="M12 6V12L16 14"
          stroke={
            locked ? WCAGColors.neutral.gray700 : WCAGColors.primary.yellow
          }
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
};
