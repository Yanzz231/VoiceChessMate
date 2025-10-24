import React from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Polygon } from 'react-native-svg';
import { WCAGColors } from '@/constants/wcagColors';

interface BoardCorners {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

interface BoardDetectionOverlayProps {
  boardDetected: boolean;
  corners?: BoardCorners;
  confidence: number;
  gridLines?: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BoardDetectionOverlay: React.FC<BoardDetectionOverlayProps> = ({
  boardDetected,
  corners,
  confidence,
  gridLines,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (boardDetected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [boardDetected]);

  if (!boardDetected || !corners) {
    return null;
  }

  const color =
    confidence > 0.8
      ? WCAGColors.semantic.success
      : confidence > 0.6
      ? WCAGColors.primary.yellow
      : WCAGColors.semantic.error;

  const scaleX = SCREEN_WIDTH / 1;
  const scaleY = SCREEN_HEIGHT / 1;

  const scaledCorners = {
    topLeft: { x: corners.topLeft.x * scaleX, y: corners.topLeft.y * scaleY },
    topRight: { x: corners.topRight.x * scaleX, y: corners.topRight.y * scaleY },
    bottomLeft: {
      x: corners.bottomLeft.x * scaleX,
      y: corners.bottomLeft.y * scaleY,
    },
    bottomRight: {
      x: corners.bottomRight.x * scaleX,
      y: corners.bottomRight.y * scaleY,
    },
  };

  const polygonPoints = `${scaledCorners.topLeft.x},${scaledCorners.topLeft.y} ${scaledCorners.topRight.x},${scaledCorners.topRight.y} ${scaledCorners.bottomRight.x},${scaledCorners.bottomRight.y} ${scaledCorners.bottomLeft.x},${scaledCorners.bottomLeft.y}`;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        <Polygon
          points={polygonPoints}
          fill="transparent"
          stroke={color}
          strokeWidth="3"
        />

        <Circle
          cx={scaledCorners.topLeft.x}
          cy={scaledCorners.topLeft.y}
          r="8"
          fill={color}
        />
        <Circle
          cx={scaledCorners.topRight.x}
          cy={scaledCorners.topRight.y}
          r="8"
          fill={color}
        />
        <Circle
          cx={scaledCorners.bottomLeft.x}
          cy={scaledCorners.bottomLeft.y}
          r="8"
          fill={color}
        />
        <Circle
          cx={scaledCorners.bottomRight.x}
          cy={scaledCorners.bottomRight.y}
          r="8"
          fill={color}
        />

        {gridLines &&
          gridLines.map((line, index) => (
            <Line
              key={index}
              x1={line.x1 * scaleX}
              y1={line.y1 * scaleY}
              x2={line.x2 * scaleX}
              y2={line.y2 * scaleY}
              stroke={color}
              strokeWidth="1"
              opacity={0.5}
            />
          ))}
      </Svg>

      {confidence > 0.8 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: scaledCorners.topLeft.y - 40,
            left: scaledCorners.topLeft.x,
            backgroundColor: color,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: WCAGColors.neutral.white,
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 12, fontWeight: '600', color: WCAGColors.neutral.white }}>
              Board Detected
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};
