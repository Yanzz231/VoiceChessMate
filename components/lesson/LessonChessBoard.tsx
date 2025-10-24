import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, PanResponder } from "react-native";
import { Chess } from "chess.js";
import { PieceRenderer } from "@/components/chess/PieceRenderer";
import { speak } from "@/utils/speechUtils";

const { width } = Dimensions.get("window");
const boardSize = width - 64;
const squareSize = boardSize / 8;
const coordinateSize = 16;

interface LessonChessBoardProps {
  game: Chess;
  currentTheme: any;
  currentPieceTheme: any;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  isWaitingForBot: boolean;
  isProcessingMove: boolean;
  voiceModeEnabled: boolean;
  onSquarePress: (square: string, piece: any) => void;
  getSquareStyle: (
    square: string,
    rowIndex: number,
    colIndex: number,
    lightSquare: string,
    darkSquare: string,
    selectedSquare: string,
    lastMoveSquare: string,
    lastMove: any
  ) => any;
}

export const LessonChessBoard: React.FC<LessonChessBoardProps> = ({
  game,
  currentTheme,
  currentPieceTheme,
  selectedSquare,
  possibleMoves,
  lastMove,
  isWaitingForBot,
  isProcessingMove,
  voiceModeEnabled,
  onSquarePress,
  getSquareStyle,
}) => {
  const lastAnnouncedSquare = useRef<string | null>(null);
  const boardLayoutRef = useRef<{ x: number; y: number } | null>(null);

  const getSquareFromPosition = (x: number, y: number): string | null => {
    if (!boardLayoutRef.current) return null;

    const relativeX = x - boardLayoutRef.current.x;
    const relativeY = y - boardLayoutRef.current.y;

    if (relativeX < 0 || relativeX > boardSize || relativeY < 0 || relativeY > boardSize) {
      return null;
    }

    const col = Math.floor(relativeX / squareSize);
    const row = Math.floor(relativeY / squareSize);

    if (col < 0 || col > 7 || row < 0 || row > 7) return null;

    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;

    return `${file}${rank}`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => voiceModeEnabled,
      onMoveShouldSetPanResponder: () => voiceModeEnabled,
      onPanResponderGrant: (evt) => {
        if (!voiceModeEnabled) return;
        const { pageX, pageY } = evt.nativeEvent;
        const square = getSquareFromPosition(pageX, pageY);
        if (square) {
          lastAnnouncedSquare.current = square;
          const board = game.board();
          const row = 8 - parseInt(square[1]);
          const col = square.charCodeAt(0) - 97;
          const piece = board[row][col];

          if (piece) {
            const pieceColor = piece.color === "w" ? "White" : "Black";
            const pieceNames: Record<string, string> = {
              p: "Pawn",
              n: "Knight",
              b: "Bishop",
              r: "Rook",
              q: "Queen",
              k: "King",
            };
            const pieceName = pieceNames[piece.type] || "Piece";
            speak(`${pieceColor} ${pieceName} on ${square}`);
          } else {
            speak(`Square ${square}`);
          }
        }
      },
      onPanResponderMove: (evt) => {
        if (!voiceModeEnabled) return;
        const { pageX, pageY } = evt.nativeEvent;
        const square = getSquareFromPosition(pageX, pageY);
        if (square && square !== lastAnnouncedSquare.current) {
          lastAnnouncedSquare.current = square;
          const board = game.board();
          const row = 8 - parseInt(square[1]);
          const col = square.charCodeAt(0) - 97;
          const piece = board[row][col];

          if (piece) {
            const pieceColor = piece.color === "w" ? "White" : "Black";
            const pieceNames: Record<string, string> = {
              p: "Pawn",
              n: "Knight",
              b: "Bishop",
              r: "Rook",
              q: "Queen",
              k: "King",
            };
            const pieceName = pieceNames[piece.type] || "Piece";
            speak(`${pieceColor} ${pieceName} on ${square}`);
          } else {
            speak(`Square ${square}`);
          }
        }
      },
      onPanResponderRelease: () => {
        lastAnnouncedSquare.current = null;
      },
    })
  ).current;

  const renderPiece = (piece: any) => {
    if (!piece) return null;

    let pieceSize = squareSize * 0.8;
    if (currentPieceTheme.version === "v2") {
      pieceSize = squareSize * 1.1;
    }

    return (
      <PieceRenderer
        type={piece.type}
        color={piece.color}
        theme={currentPieceTheme.version}
        size={pieceSize}
      />
    );
  };

  const renderSquare = (
    square: string,
    piece: any,
    rowIndex: number,
    colIndex: number
  ) => {
    const squareStyle = getSquareStyle(
      square,
      rowIndex,
      colIndex,
      currentTheme.lightSquare,
      currentTheme.darkSquare,
      currentTheme.selectedSquare,
      currentTheme.lastMoveSquare,
      lastMove
    );

    const pieceNames: Record<string, string> = {
      p: "Pawn",
      n: "Knight",
      b: "Bishop",
      r: "Rook",
      q: "Queen",
      k: "King",
    };

    const accessibilityLabel = piece
      ? `${piece.color === "w" ? "White" : "Black"} ${pieceNames[piece.type] || "Piece"} on ${square}`
      : `Empty square ${square}`;

    return (
      <TouchableOpacity
        key={square}
        style={{
          width: squareSize,
          height: squareSize,
          backgroundColor: squareStyle.backgroundColor,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          opacity: isWaitingForBot || isProcessingMove ? 0.7 : 1,
        }}
        onPress={() => onSquarePress(square, piece)}
        disabled={isWaitingForBot || isProcessingMove}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={piece ? "Tap to select or move piece" : "Tap to move selected piece here"}
        accessibilityState={{ disabled: isWaitingForBot || isProcessingMove }}
      >
        {renderPiece(piece)}

        {squareStyle.isPossibleMove && !piece && (
          <View
            style={{
              width: squareSize * 0.3,
              height: squareSize * 0.3,
              borderRadius: squareSize * 0.15,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            }}
            accessible={false}
          />
        )}

        {squareStyle.isPossibleMove && piece && (
          <View
            style={{
              position: "absolute",
              width: squareSize,
              height: squareSize,
              borderWidth: 3,
              borderColor: "rgba(255, 0, 0, 0.7)",
              borderRadius: 4,
            }}
            accessible={false}
          />
        )}

        {squareStyle.isKingInCheck && (
          <View
            style={{
              position: "absolute",
              width: squareSize,
              height: squareSize,
              backgroundColor: "rgba(255, 68, 68, 0.7)",
              borderWidth: 4,
              borderColor: "#ffffff",
              borderRadius: 4,
            }}
            accessible={false}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderFileLabels = () => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    return (
      <View
        style={{ flexDirection: "row", justifyContent: "center", marginTop: 4 }}
        accessible={false}
      >
        <View style={{ width: coordinateSize }} />
        {files.map((file) => (
          <View
            key={file}
            style={{
              width: squareSize,
              height: coordinateSize,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#666" }}>
              {file}
            </Text>
          </View>
        ))}
        <View style={{ width: coordinateSize }} />
      </View>
    );
  };

  const renderRankLabels = () => {
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    return (
      <View style={{ justifyContent: "center", marginRight: 4 }} accessible={false}>
        {ranks.map((rank) => (
          <View
            key={rank}
            style={{
              width: coordinateSize,
              height: squareSize,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#666" }}>
              {rank}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderBoard = () => {
    const board = game.board();
    const squares = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        const square = String.fromCharCode(97 + col) + (8 - row);
        squares.push(renderSquare(square, piece, row, col));
      }
    }

    return (
      <View style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {renderRankLabels()}
          <View
            {...panResponder.panHandlers}
            onLayout={(event) => {
              const { x, y } = event.nativeEvent.layout;
              event.currentTarget.measure((fx, fy, width, height, px, py) => {
                boardLayoutRef.current = { x: px, y: py };
              });
            }}
            style={{
              width: boardSize,
              height: boardSize,
              flexDirection: "row",
              flexWrap: "wrap",
            }}
            accessible={true}
            accessibilityRole="none"
            accessibilityLabel="Chess board"
          >
            {squares}
          </View>
          <View style={{ justifyContent: "center", marginLeft: 4 }}>
            {renderRankLabels().props.children}
          </View>
        </View>
        {renderFileLabels()}
      </View>
    );
  };

  return renderBoard();
};
