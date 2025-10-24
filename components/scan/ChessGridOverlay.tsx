import React from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, Line, Polygon } from 'react-native-svg';
import { WCAGColors } from '@/constants/wcagColors';

interface BoardCorners {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

interface SquareDetection {
  square: string;
  hasPiece: boolean;
  pieceType?: string;
  pieceColor?: 'white' | 'black';
  confidence: number;
}

interface ChessGridOverlayProps {
  boardDetected: boolean;
  corners?: BoardCorners;
  squareDetections?: SquareDetection[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChessGridOverlayComponent: React.FC<ChessGridOverlayProps> = ({
  boardDetected,
  corners,
  squareDetections = [],
}) => {

  if (!boardDetected || !corners) {
    return (
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <View style={{
          position: 'absolute',
          top: SCREEN_HEIGHT / 2 - 100,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 20,
          borderRadius: 12,
          alignItems: 'center',
        }}>
          <Text style={{
            color: WCAGColors.neutral.white,
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Looking for chess board...
          </Text>
          <Text style={{
            color: WCAGColors.neutral.gray400,
            fontSize: 14,
            textAlign: 'center',
          }}>
            Point camera at a chess board
          </Text>
        </View>
      </View>
    );
  }

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

  const getSquarePosition = (row: number, col: number) => {
    const tlX = scaledCorners.topLeft.x;
    const tlY = scaledCorners.topLeft.y;
    const trX = scaledCorners.topRight.x;
    const trY = scaledCorners.topRight.y;
    const blX = scaledCorners.bottomLeft.x;
    const blY = scaledCorners.bottomLeft.y;
    const brX = scaledCorners.bottomRight.x;
    const brY = scaledCorners.bottomRight.y;

    const rowRatio = row / 8;
    const colRatio = col / 8;

    const topX = tlX + (trX - tlX) * colRatio;
    const topY = tlY + (trY - tlY) * colRatio;
    const bottomX = blX + (brX - blX) * colRatio;
    const bottomY = blY + (brY - blY) * colRatio;

    const x = topX + (bottomX - topX) * rowRatio;
    const y = topY + (bottomY - topY) * rowRatio;

    return { x, y };
  };

  const getSquareSize = () => {
    const topWidth = Math.sqrt(
      Math.pow(scaledCorners.topRight.x - scaledCorners.topLeft.x, 2) +
      Math.pow(scaledCorners.topRight.y - scaledCorners.topLeft.y, 2)
    );
    return topWidth / 8;
  };

  const squareSize = getSquareSize();

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getSquareDetection = (file: string, rank: string) => {
    return squareDetections.find((s) => s.square === `${file}${rank}`);
  };

  const renderGrid = () => {
    const elements = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pos = getSquarePosition(row, col);
        const nextRowPos = getSquarePosition(row + 1, col);
        const nextColPos = getSquarePosition(row, col + 1);

        const squareName = `${files[col]}${ranks[row]}`;
        const detection = getSquareDetection(files[col], ranks[row]);

        const isDarkSquare = (row + col) % 2 === 1;
        const baseColor = isDarkSquare
          ? 'rgba(100, 100, 100, 0.15)'
          : 'rgba(200, 200, 200, 0.1)';

        let fillColor = baseColor;
        let strokeColor = 'rgba(255, 255, 255, 0.25)';
        let strokeWidth = 0.5;

        if (detection && detection.hasPiece) {
          fillColor =
            detection.pieceColor === 'white'
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(0, 0, 0, 0.4)';
          strokeColor = '#00FF00';
          strokeWidth = 1.5;
        }

        const nextRowNextColPos = getSquarePosition(row + 1, col + 1);
        const squarePoints = `${pos.x},${pos.y} ${nextColPos.x},${nextColPos.y} ${nextRowNextColPos.x},${nextRowNextColPos.y} ${nextRowPos.x},${nextRowPos.y}`;

        elements.push(
          <Polygon
            key={`square-${row}-${col}`}
            points={squarePoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

        if (detection && detection.hasPiece && detection.pieceType) {
          const centerX = pos.x + (nextColPos.x - pos.x) / 2;
          const centerY = pos.y + (nextRowPos.y - pos.y) / 2;

          elements.push(
            <SvgText
              key={`piece-${row}-${col}`}
              x={centerX}
              y={centerY}
              fontSize="12"
              fill={WCAGColors.primary.yellow}
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {detection.pieceType.charAt(0).toUpperCase()}
            </SvgText>
          );
        }

        if (row === 0) {
          elements.push(
            <SvgText
              key={`file-${col}`}
              x={pos.x + (nextColPos.x - pos.x) / 2}
              y={pos.y - 10}
              fontSize="10"
              fill={WCAGColors.neutral.white}
              fontWeight="bold"
              textAnchor="middle"
            >
              {files[col]}
            </SvgText>
          );
        }

        if (col === 0) {
          elements.push(
            <SvgText
              key={`rank-${row}`}
              x={pos.x - 15}
              y={pos.y + (nextRowPos.y - pos.y) / 2}
              fontSize="10"
              fill={WCAGColors.neutral.white}
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {ranks[row]}
            </SvgText>
          );
        }
      }
    }

    return elements;
  };

  const detectedPiecesCount = squareDetections.filter((s) => s.hasPiece).length;

  const cornerSize = 40;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        {renderGrid()}

        <Line
          x1={scaledCorners.topLeft.x}
          y1={scaledCorners.topLeft.y}
          x2={scaledCorners.topRight.x}
          y2={scaledCorners.topRight.y}
          stroke="#00FF00"
          strokeWidth="5"
        />
        <Line
          x1={scaledCorners.topRight.x}
          y1={scaledCorners.topRight.y}
          x2={scaledCorners.bottomRight.x}
          y2={scaledCorners.bottomRight.y}
          stroke="#00FF00"
          strokeWidth="5"
        />
        <Line
          x1={scaledCorners.bottomRight.x}
          y1={scaledCorners.bottomRight.y}
          x2={scaledCorners.bottomLeft.x}
          y2={scaledCorners.bottomLeft.y}
          stroke="#00FF00"
          strokeWidth="5"
        />
        <Line
          x1={scaledCorners.bottomLeft.x}
          y1={scaledCorners.bottomLeft.y}
          x2={scaledCorners.topLeft.x}
          y2={scaledCorners.topLeft.y}
          stroke="#00FF00"
          strokeWidth="5"
        />

        <Line
          x1={scaledCorners.topLeft.x}
          y1={scaledCorners.topLeft.y}
          x2={scaledCorners.topLeft.x + cornerSize}
          y2={scaledCorners.topLeft.y}
          stroke="#00FF00"
          strokeWidth="3"
        />
        <Line
          x1={scaledCorners.topLeft.x}
          y1={scaledCorners.topLeft.y}
          x2={scaledCorners.topLeft.x}
          y2={scaledCorners.topLeft.y + cornerSize}
          stroke="#00FF00"
          strokeWidth="3"
        />

        <Line
          x1={scaledCorners.topRight.x}
          y1={scaledCorners.topRight.y}
          x2={scaledCorners.topRight.x - cornerSize}
          y2={scaledCorners.topRight.y}
          stroke="#00FF00"
          strokeWidth="3"
        />
        <Line
          x1={scaledCorners.topRight.x}
          y1={scaledCorners.topRight.y}
          x2={scaledCorners.topRight.x}
          y2={scaledCorners.topRight.y + cornerSize}
          stroke="#00FF00"
          strokeWidth="3"
        />

        <Line
          x1={scaledCorners.bottomLeft.x}
          y1={scaledCorners.bottomLeft.y}
          x2={scaledCorners.bottomLeft.x + cornerSize}
          y2={scaledCorners.bottomLeft.y}
          stroke="#00FF00"
          strokeWidth="3"
        />
        <Line
          x1={scaledCorners.bottomLeft.x}
          y1={scaledCorners.bottomLeft.y}
          x2={scaledCorners.bottomLeft.x}
          y2={scaledCorners.bottomLeft.y - cornerSize}
          stroke="#00FF00"
          strokeWidth="3"
        />

        <Line
          x1={scaledCorners.bottomRight.x}
          y1={scaledCorners.bottomRight.y}
          x2={scaledCorners.bottomRight.x - cornerSize}
          y2={scaledCorners.bottomRight.y}
          stroke="#00FF00"
          strokeWidth="3"
        />
        <Line
          x1={scaledCorners.bottomRight.x}
          y1={scaledCorners.bottomRight.y}
          x2={scaledCorners.bottomRight.x}
          y2={scaledCorners.bottomRight.y - cornerSize}
          stroke="#00FF00"
          strokeWidth="3"
        />
      </Svg>

      <View
        style={{
          position: 'absolute',
          top: scaledCorners.topLeft.y - 40,
          left: scaledCorners.topLeft.x,
          backgroundColor: 'rgba(0, 255, 0, 0.9)',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#000',
          }}
        >
          Detected board quad (expanded)
        </Text>
      </View>

      {detectedPiecesCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: scaledCorners.bottomLeft.y + 10,
            left: scaledCorners.topLeft.x,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#00FF00',
            }}
          >
            {detectedPiecesCount} pieces detected
          </Text>
        </View>
      )}
    </View>
  );
};

export const ChessGridOverlay = React.memo(ChessGridOverlayComponent, (prevProps, nextProps) => {
  const cornersEqual =
    prevProps.corners?.topLeft.x === nextProps.corners?.topLeft.x &&
    prevProps.corners?.topLeft.y === nextProps.corners?.topLeft.y &&
    prevProps.corners?.topRight.x === nextProps.corners?.topRight.x &&
    prevProps.corners?.topRight.y === nextProps.corners?.topRight.y &&
    prevProps.corners?.bottomLeft.x === nextProps.corners?.bottomLeft.x &&
    prevProps.corners?.bottomLeft.y === nextProps.corners?.bottomLeft.y &&
    prevProps.corners?.bottomRight.x === nextProps.corners?.bottomRight.x &&
    prevProps.corners?.bottomRight.y === nextProps.corners?.bottomRight.y;

  return (
    prevProps.boardDetected === nextProps.boardDetected &&
    cornersEqual &&
    (prevProps.squareDetections?.length || 0) === (nextProps.squareDetections?.length || 0)
  );
});
