import React from 'react';
import Svg, { Path, Polygon } from 'react-native-svg';
import { WCAGColors } from '@/constants/wcagColors';

interface SparkleIconProps {
  size?: number;
  color?: string;
  style?: any;
}

export const SparkleIcon: React.FC<SparkleIconProps> = ({
  size = 20,
  color = WCAGColors.primary.yellow,
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
        fill={color}
      />
    </Svg>
  );
};

export const StarIcon: React.FC<SparkleIconProps> = ({
  size = 16,
  color = WCAGColors.primary.yellowLight,
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
      />
    </Svg>
  );
};

export const CircleIcon: React.FC<SparkleIconProps> = ({
  size = 12,
  color = WCAGColors.primary.yellowLight,
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        fill={color}
      />
    </Svg>
  );
};
