import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chess } from "chess.js";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PieceRenderer } from "@/components/chess/PieceRenderer";
import {
  DEFAULT_PIECE_THEME,
  PIECE_THEMES,
  PieceTheme,
} from "@/constants/chessPieceThemes";
import {
  CHESS_THEMES,
  ChessTheme,
  DEFAULT_THEME,
} from "@/constants/chessThemes";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import { useGameDetail } from "@/hooks/useGameDetail";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

const { width } = Dimensions.get("window");
const boardSize = width - 64;
const squareSize = boardSize / 8;
const coordinateSize = 16;

interface EnhancedMoveData {
  move: string;
  fen: string;
  best_move: string;
  eval_graph: number;
  is_eval_mate: boolean;
  move_grade: string;
}

export default function GameDetailScreen() {
  const { gameId, moveAmount } = useLocalSearchParams<{
    gameId: string;
    moveAmount: string;
  }>();
  const [game, setGame] = useState(() => new Chess());
  const [currentTheme, setCurrentTheme] = useState<ChessTheme>(DEFAULT_THEME);
  const [currentPieceTheme, setCurrentPieceTheme] =
    useState<PieceTheme>(DEFAULT_PIECE_THEME);

  const totalMovesFromAnalysis = moveAmount
    ? parseInt(moveAmount, 10)
    : undefined;

  const {
    currentMove,
    totalMoves,
    moveData,
    loading,
    error,
    goToMove,
    nextMove,
    prevMove,
    goToStart,
    goToEnd,
  } = useGameDetail(gameId || "", totalMovesFromAnalysis);

  const enhancedMoveData = moveData as EnhancedMoveData | null;

  const { processVoiceCommand } = useVoiceNavigation({
    onNavigationStart: (screen) => {
      let navigationMessage = "";
      switch (screen) {
        case "play":
          navigationMessage = "Opening game";
          break;
        case "scan":
          navigationMessage = "Opening camera";
          break;
        case "lesson":
          navigationMessage = "Opening lessons";
          break;
        case "analyze":
          navigationMessage = "Opening analysis";
          break;
        case "setting":
          navigationMessage = "Opening settings";
          break;
        default:
          navigationMessage = "Starting navigation";
      }

      Speech.speak(navigationMessage, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    },
  });

  const handleTranscriptComplete = useCallback(
    async (result: any) => {
      if (result?.text) {
        const transcriptText = result.text.trim();

        Speech.speak("Command received", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });

        await processVoiceCommand(transcriptText);
      } else {
        Speech.speak("Command not understood", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      }
    },
    [processVoiceCommand]
  );

  const { handleTouchStart, handleTouchEnd, cleanup } = useVoiceRecording({
    language: "id-ID",
    longPressThreshold: 1000,
    onTranscriptComplete: handleTranscriptComplete,
  });

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeId = await AsyncStorage.getItem(
          CHESS_STORAGE_KEYS.THEME
        );
        if (savedThemeId) {
          const theme =
            CHESS_THEMES.find((t) => t.id === savedThemeId) || DEFAULT_THEME;
          setCurrentTheme(theme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };

    const loadPieceTheme = async () => {
      try {
        const savedPieceThemeId = await AsyncStorage.getItem(
          CHESS_STORAGE_KEYS.PIECE_THEME
        );
        if (savedPieceThemeId) {
          const theme =
            PIECE_THEMES.find((t) => t.id === savedPieceThemeId) ||
            DEFAULT_PIECE_THEME;
          setCurrentPieceTheme(theme);
        }
      } catch (error) {
        console.error("Error loading piece theme:", error);
      }
    };

    loadTheme();
    loadPieceTheme();
  }, []);

  useEffect(() => {
    if (moveData?.fen) {
      const newGame = new Chess(moveData.fen);
      setGame(newGame);
    }
  }, [moveData]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const getEvaluationColor = (score: number) => {
    if (score > 2) return "#22c55e";
    if (score > 0.5) return "#84cc16";
    if (score > -0.5) return "#eab308";
    if (score > -2) return "#f97316";
    return "#ef4444";
  };

  const getEvaluationText = (score: number, isMate: boolean) => {
    if (isMate) {
      return score > 0 ? "White checkmates" : "Black checkmates";
    }

    if (Math.abs(score) < 0.2) return "Equal position";
    if (score > 0) {
      if (score > 3) return `White winning (+${score.toFixed(1)})`;
      if (score > 1) return `White better (+${score.toFixed(1)})`;
      return `White slightly better (+${score.toFixed(1)})`;
    } else {
      const absScore = Math.abs(score);
      if (absScore > 3) return `Black winning (-${absScore.toFixed(1)})`;
      if (absScore > 1) return `Black better (-${absScore.toFixed(1)})`;
      return `Black slightly better (-${absScore.toFixed(1)})`;
    }
  };

  const getMoveGradeColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case "excellent":
        return "#22c55e";
      case "good":
        return "#84cc16";
      case "inaccuracy":
        return "#eab308";
      case "mistake":
        return "#f97316";
      case "blunder":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getMoveGradeIcon = (grade: string) => {
    switch (grade.toLowerCase()) {
      case "excellent":
        return "checkmark-circle";
      case "good":
        return "thumbs-up";
      case "inaccuracy":
        return "warning";
      case "mistake":
        return "close-circle";
      case "blunder":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

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
    const isLight = (rowIndex + colIndex) % 2 === 0;
    let backgroundColor = isLight
      ? currentTheme.lightSquare
      : currentTheme.darkSquare;

    const isBestMoveSquare =
      moveData?.best_move &&
      (square === moveData.best_move.substring(0, 2) ||
        square === moveData.best_move.substring(2, 4));

    if (isBestMoveSquare) {
      backgroundColor = "#22C55E";
    }

    return (
      <View
        key={square}
        style={{
          width: squareSize,
          height: squareSize,
          backgroundColor,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {renderPiece(piece)}

        {isBestMoveSquare && (
          <View
            style={{
              position: "absolute",
              width: squareSize,
              height: squareSize,
              borderWidth: 3,
              borderColor: "#16A34A",
              borderRadius: 4,
            }}
          />
        )}
      </View>
    );
  };

  const renderFileLabels = () => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    return (
      <View className="flex-row justify-center mt-1">
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
            <Text className="text-xs font-semibold text-gray-600">{file}</Text>
          </View>
        ))}
        <View style={{ width: coordinateSize }} />
      </View>
    );
  };

  const renderRankLabels = () => {
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    return (
      <View className="justify-center mr-1">
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
            <Text className="text-xs font-semibold text-gray-600">{rank}</Text>
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
      <View className="items-center">
        <View className="flex-row items-center">
          {renderRankLabels()}
          <View
            style={{
              width: boardSize,
              height: boardSize,
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {squares}
          </View>
          <View className="justify-center ml-1">
            {renderRankLabels().props.children}
          </View>
        </View>
        {renderFileLabels()}
      </View>
    );
  };

  const formatMove = (move: string) => {
    if (!move || move.length < 4) return move;
    const from = move.substring(0, 2);
    const to = move.substring(2, 4);
    return `${from.toUpperCase()} → ${to.toUpperCase()}`;
  };

  const renderEvaluationBar = () => {
    if (!enhancedMoveData?.eval_graph && enhancedMoveData?.eval_graph !== 0)
      return null;

    const score = enhancedMoveData.eval_graph;
    const isMate = enhancedMoveData.is_eval_mate;

    const clampedScore = Math.max(-10, Math.min(10, score));
    const percentage = ((clampedScore + 10) / 20) * 100;

    return (
      <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          Position Evaluation
        </Text>

        <View className="mb-3">
          <View className="h-8 bg-gray-200 rounded-lg overflow-hidden flex-row">
            <View className="bg-red-400 h-full" style={{ width: "50%" }} />
            <View className="bg-green-400 h-full" style={{ width: "50%" }} />
            <View
              className="absolute h-8 w-1 bg-gray-900 rounded-full"
              style={{
                left: `${percentage}%`,
                transform: [{ translateX: -2 }],
              }}
            />
          </View>

          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-gray-500">Black advantage</Text>
            <Text className="text-xs text-gray-500">White advantage</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text
            className="text-sm font-medium"
            style={{ color: getEvaluationColor(score) }}
          >
            {getEvaluationText(score, isMate)}
          </Text>
          {isMate && (
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={16} color="#f59e0b" />
              <Text className="text-xs text-amber-600 ml-1 font-medium">
                MATE
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMoveQuality = () => {
    if (!enhancedMoveData?.move_grade) return null;

    const grade = enhancedMoveData.move_grade;
    const color = getMoveGradeColor(grade);
    const icon = getMoveGradeIcon(grade);

    return (
      <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          Move Quality
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: color + "20" }}
            >
              <Ionicons name={icon as any} size={16} color={color} />
            </View>
            <View>
              <Text className="text-base font-semibold" style={{ color }}>
                {grade}
              </Text>
              <Text className="text-xs text-gray-500">Move assessment</Text>
            </View>
          </View>

          <View className="items-end">
            {grade.toLowerCase() === "excellent" && (
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={12} color="#22c55e" />
                ))}
              </View>
            )}
            {grade.toLowerCase() === "good" && (
              <View className="flex-row">
                {[1, 2, 3, 4].map((star) => (
                  <Ionicons key={star} name="star" size={12} color="#84cc16" />
                ))}
                <Ionicons name="star-outline" size={12} color="#d1d5db" />
              </View>
            )}
            {grade.toLowerCase() === "inaccuracy" && (
              <View className="flex-row">
                {[1, 2, 3].map((star) => (
                  <Ionicons key={star} name="star" size={12} color="#eab308" />
                ))}
                {[4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star-outline"
                    size={12}
                    color="#d1d5db"
                  />
                ))}
              </View>
            )}
            {(grade.toLowerCase() === "mistake" ||
              grade.toLowerCase() === "blunder") && (
              <View className="flex-row">
                <Ionicons name="star" size={12} color="#ef4444" />
                {[2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star-outline"
                    size={12}
                    color="#d1d5db"
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && currentMove <= 1) {
    return (
      <View
        className="flex-1 bg-gray-50"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <StatusBar style="dark" />

        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-1"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Game Analysis
            </Text>
          </View>
        </SafeAreaView>

        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#374151" />
          <Text className="text-gray-600 mt-4 text-base">
            Loading game data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <StatusBar style="dark" />

      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-1"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 text-center">
              Game Analysis
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Move {currentMove} of {totalMoves}
            </Text>
          </View>
          <View className="w-6" />
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-sm text-gray-600">Current Move</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {moveData?.move
                  ? formatMove(moveData.move)
                  : "Starting Position"}
              </Text>
            </View>
            {moveData?.best_move && (
              <View className="flex-1 items-end">
                <Text className="text-sm text-gray-600">Best Move</Text>
                <Text className="text-lg font-semibold text-green-600">
                  {formatMove(moveData.best_move)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="py-6">
          <View className="items-center">{renderBoard()}</View>
        </View>

        {renderEvaluationBar()}
        {renderMoveQuality()}

        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Game Information
          </Text>
          <View className="space-y-1">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Game ID:</Text>
              <Text className="text-sm font-mono text-gray-900">
                {gameId?.slice(0, 8)}...
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total Moves:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {totalMoves}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Current Position:</Text>
              <Text className="text-sm font-medium text-gray-900">
                Move {currentMove}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">Position</Text>
            <Text className="text-sm font-medium text-gray-900">
              {currentMove} / {totalMoves}
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full">
            <View
              className="h-2 bg-gray-900 rounded-full"
              style={{
                width:
                  totalMoves > 0
                    ? `${(currentMove / totalMoves) * 100}%`
                    : "0%",
              }}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={goToStart}
            disabled={currentMove <= 1 || loading}
            className={`items-center justify-center w-12 h-12 rounded-xl ${
              currentMove <= 1 || loading ? "bg-gray-100" : "bg-gray-900"
            }`}
          >
            <Ionicons
              name="play-skip-back"
              size={20}
              color={currentMove <= 1 || loading ? "#9CA3AF" : "white"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={prevMove}
            disabled={currentMove <= 1 || loading}
            className={`items-center justify-center w-12 h-12 rounded-xl ${
              currentMove <= 1 || loading ? "bg-gray-100" : "bg-gray-900"
            }`}
          >
            <Ionicons
              name="play-back"
              size={20}
              color={currentMove <= 1 || loading ? "#9CA3AF" : "white"}
            />
          </TouchableOpacity>

          <View className="items-center">
            {loading ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <Text className="text-base font-semibold text-gray-900">
                {currentMove}
              </Text>
            )}
            <Text className="text-xs text-gray-500">Move</Text>
          </View>

          <TouchableOpacity
            onPress={nextMove}
            disabled={currentMove >= totalMoves || loading}
            className={`items-center justify-center w-12 h-12 rounded-xl ${
              currentMove >= totalMoves || loading
                ? "bg-gray-100"
                : "bg-gray-900"
            }`}
          >
            <Ionicons
              name="play-forward"
              size={20}
              color={currentMove >= totalMoves || loading ? "#9CA3AF" : "white"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToEnd}
            disabled={currentMove >= totalMoves || loading}
            className={`items-center justify-center w-12 h-12 rounded-xl ${
              currentMove >= totalMoves || loading
                ? "bg-gray-100"
                : "bg-gray-900"
            }`}
          >
            <Ionicons
              name="play-skip-forward"
              size={20}
              color={currentMove >= totalMoves || loading ? "#9CA3AF" : "white"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
