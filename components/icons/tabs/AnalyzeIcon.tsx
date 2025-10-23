import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AnalyzeIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const AnalyzeIcon: React.FC<AnalyzeIconProps> = ({
  size = 24,
  color = '#000',
  focused = false
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 20V10M12 20V4M6 20V14"
        stroke={color}
        strokeWidth={focused ? "2.5" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
