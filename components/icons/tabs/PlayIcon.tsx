import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PlayIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const PlayIcon: React.FC<PlayIconProps> = ({
  size = 24,
  color = '#000',
  focused = false
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth={focused ? "2.5" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 8L16 12L10 16V8Z"
        stroke={color}
        strokeWidth={focused ? "2.5" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};
