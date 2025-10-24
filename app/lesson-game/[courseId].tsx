import { Chess } from "chess.js";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  SafeAreaView,
  View,
} from "react-native";

import { MoveHistory } from "@/components/chess/MoveHistory";
import { LessonGameHeader } from "@/components/lesson/LessonGameHeader";
import { LessonGameStatus } from "@/components/lesson/LessonGameStatus";
import { LessonGameControls } from "@/components/lesson/LessonGameControls";
import { LessonChessBoard } from "@/components/lesson/LessonChessBoard";
import { LessonHintModal } from "@/components/lesson/modals/LessonHintModal";
import { LessonBackModal } from "@/components/lesson/modals/LessonBackModal";
import { LessonCompleteModal } from "@/components/lesson/modals/LessonCompleteModal";
import { LessonSettingsModal } from "@/components/lesson/modals/LessonSettingsModal";
import { LessonPromotionModal } from "@/components/lesson/modals/LessonPromotionModal";

import { useBotMove } from "@/hooks/useBotMove";
import { useChessBoard } from "@/hooks/useChessBoard";
import { useChessHints } from "@/hooks/useChessHints";
import { useChessSettings } from "@/hooks/useChessSettings";
import { useGameState } from "@/hooks/useGameState";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useVoiceChess } from "@/hooks/useVoiceChess";
import { WCAGColors } from "@/constants/wcagColors";
import { speak } from "@/utils/speechUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";

export default function LessonGameScreen() {
  const { courseId, fen, objective, title } = useLocalSearchParams<{
    courseId: string;
    fen: string;
    objective: string;
    title: string;
  }>();

  const [showHintModal, setShowHintModal] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Array<{ moveNumber: number; white: string; black?: string }>>([]);

  const { currentTheme, currentPieceTheme } = useChessSettings();

  const {
    game,
    setGame,
    gameStates,
    setGameStates,
    gameStatus,
    lastMove,
    setLastMove,
    initializeGame,
    addGameState,
  } = useGameState(
    fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );

  const handleMoveComplete = useCallback(
    (move: any, newGame: any) => {
      if (move && move.from && move.to) {
        setLastMove({ from: move.from, to: move.to });
      }
      setGame(newGame);
      addGameState(newGame);
      resetSelection();
    },
    [setGame, addGameState, setLastMove]
  );

  const {
    selectedSquare,
    possibleMoves,
    pendingPromotion,
    showPromotionModal,
    setShowPromotionModal,
    handleSquarePress,
    handlePromotion,
    getSquareStyle,
    resetSelection,
  } = useChessBoard(
    game,
    handleMoveComplete,
    "white",
    gameStatus === "playing"
  );

  const { isWaitingForBot, makeBotMove } = useBotMove();

  const { isProcessingMove, handleTouchStart, handleTouchEnd, cleanup } =
    useVoiceChess({
      game,
      onMoveComplete: handleMoveComplete,
    });

  const { getHint } = useChessHints();
  const { saveMultipleValues } = useGameStorage();

  useEffect(() => {
    initializeGame();

    const loadVoiceMode = async () => {
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      setVoiceModeEnabled(voiceMode === "true");

      if (voiceMode === "true" && objective) {
        setTimeout(() => {
          speak(`Lesson: ${title}. Objective: ${objective}`);
        }, 1000);
      }
    };

    loadVoiceMode();
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const status = checkGameStatus();
    const playerMoveCount = Math.floor(gameStates.length / 2);

    const isBasicLesson = objective?.toLowerCase().includes("move") ||
                          objective?.toLowerCase().includes("different squares");

    const isCaptureLesson = objective?.toLowerCase().includes("capture");

    if (status !== "playing") {
      handleCourseComplete();
    } else if (isBasicLesson && playerMoveCount >= 1) {
      handleCourseComplete();
    } else if (isCaptureLesson && playerMoveCount >= 1) {
      const currentPieceCount = game.board().flat().filter(p => p !== null).length;
      if (currentPieceCount < 4) {
        handleCourseComplete();
      }
    }
  }, [game, gameStates.length]);

  useEffect(() => {
    const currentPlayerColor = "w";
    const isBotTurn = game.turn() !== currentPlayerColor;

    if (
      isBotTurn &&
      gameStatus === "playing" &&
      !isWaitingForBot &&
      !isProcessingMove &&
      gameStates.length > 1
    ) {
      setTimeout(() => {
        makeBotMove({
          game,
          difficulty: "easy",
          onMoveComplete: handleMoveComplete,
        });
      }, 1000);
    }
  }, [game, gameStatus, isWaitingForBot, isProcessingMove, gameStates.length]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showPromotionModal || showCompletedModal) {
          return false;
        }
        setShowBackModal(true);
        return true;
      }
    );

    return () => backHandler.remove();
  }, [showPromotionModal, showCompletedModal]);

  useEffect(() => {
    const moves: Array<{ moveNumber: number; white: string; black?: string }> = [];
    const history = game.history({ verbose: true });

    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = history[i];
      const blackMove = history[i + 1];

      moves.push({
        moveNumber,
        white: whiteMove.san,
        black: blackMove?.san,
      });
    }

    setMoveHistory(moves);
  }, [gameStates.length]);

  const checkGameStatus = () => {
    if (game.isCheckmate()) {
      return "checkmate";
    } else if (game.isStalemate()) {
      return "stalemate";
    } else if (game.isDraw()) {
      return "draw";
    } else {
      return "playing";
    }
  };

  const handleCourseComplete = async () => {
    try {
      await saveMultipleValues([
        [`course_${courseId}_completed`, "true"],
        ["lesson_session", ""],
        ["current_course_id", ""],
        ["current_lesson_id", ""],
        ["lesson_game_id", ""],
      ]);

      setTimeout(() => {
        setShowCompletedModal(true);
        if (voiceModeEnabled) {
          speak(`Course Complete! You have successfully completed ${title}`);
        }
      }, 1000);
    } catch (error) {
      // Error saving completion
    }
  };

  const handleHintRequest = async () => {
    const result = await getHint(
      game,
      gameStatus,
      isWaitingForBot,
      isProcessingMove,
      "white"
    );
    setHintMessage(result.message);
    setShowHintModal(true);
  };

  const handleUndo = () => {
    if (isWaitingForBot || gameStates.length <= 1 || isProcessingMove) {
      Alert.alert("Cannot Undo", "No moves to undo.");
      return;
    }

    const currentPlayerColor = "w";
    let targetStateIndex = -1;

    for (let i = gameStates.length - 2; i >= 0; i--) {
      if (gameStates[i].turn === currentPlayerColor) {
        targetStateIndex = i;
        break;
      }
    }

    if (targetStateIndex === -1) {
      Alert.alert("Cannot Undo", "No player moves to undo.");
      return;
    }

    const targetState = gameStates[targetStateIndex];
    const newGameStates = gameStates.slice(0, targetStateIndex + 1);

    setGame(new Chess(targetState.fen));
    setGameStates(newGameStates);
    resetSelection();
    setLastMove(null);
  };

  const handleSquareTap = (square: string, piece: any) => {
    if (voiceModeEnabled) {
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
    handleSquarePress(square);
  };

  const currentPlayer = game.turn() === "w" ? "White" : "Black";
  const currentPlayerColor = "w";

  const canUndo = (() => {
    if (
      isWaitingForBot ||
      gameStatus !== "playing" ||
      gameStates.length <= 1 ||
      isProcessingMove
    ) {
      return false;
    }
    for (let i = gameStates.length - 2; i >= 0; i--) {
      if (gameStates[i].turn === currentPlayerColor) {
        return true;
      }
    }
    return false;
  })();

  const isVoiceDisabled =
    isWaitingForBot || gameStatus !== "playing" || isProcessingMove;
  const currentPlayerTurn = game.turn() === currentPlayerColor;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WCAGColors.neutral.gray50 }}>
      <StatusBar backgroundColor={WCAGColors.primary.yellow} />

      <LessonGameHeader
        title={title || ""}
        currentPlayer={currentPlayer}
        currentThemeName={currentTheme.name}
        isWaitingForBot={isWaitingForBot}
        isProcessingMove={isProcessingMove}
        onBackPress={() => setShowBackModal(true)}
        onSettingsPress={() => setShowSettingsModal(true)}
        voiceModeEnabled={voiceModeEnabled}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />

      <View style={{ flex: 1, backgroundColor: WCAGColors.neutral.gray50 }}>
        <LessonGameStatus
          gameStatus={gameStatus}
          currentPlayer={currentPlayer}
          isWaitingForBot={isWaitingForBot}
          isProcessingMove={isProcessingMove}
          gameStatesLength={gameStates.length}
          objective={objective || ""}
          isInCheck={game.inCheck()}
          voiceModeEnabled={voiceModeEnabled}
          onTextPress={(text) => voiceModeEnabled && speak(text)}
        />

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 }}>
          <LessonChessBoard
            game={game}
            currentTheme={currentTheme}
            currentPieceTheme={currentPieceTheme}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            lastMove={lastMove}
            isWaitingForBot={isWaitingForBot}
            isProcessingMove={isProcessingMove}
            voiceModeEnabled={voiceModeEnabled}
            onSquarePress={handleSquareTap}
            getSquareStyle={getSquareStyle}
          />

          {moveHistory.length > 0 && (
            <View style={{ marginTop: 16, width: "100%", paddingHorizontal: 4 }}>
              <MoveHistory moves={moveHistory} voiceModeEnabled={voiceModeEnabled} />
            </View>
          )}
        </View>
      </View>

      <LessonGameControls
        isVoiceDisabled={isVoiceDisabled}
        currentPlayerTurn={currentPlayerTurn}
        isProcessingMove={isProcessingMove}
        canUndo={canUndo}
        onQuitPress={() => setShowBackModal(true)}
        onVoicePressIn={handleTouchStart}
        onVoicePressOut={handleTouchEnd}
        onHintPress={handleHintRequest}
        onUndoPress={handleUndo}
      />

      <LessonBackModal
        visible={showBackModal}
        voiceModeEnabled={voiceModeEnabled}
        onClose={() => setShowBackModal(false)}
        onQuit={() => {
          setShowBackModal(false);
          router.back();
        }}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />

      <LessonHintModal
        visible={showHintModal}
        hintMessage={hintMessage}
        voiceModeEnabled={voiceModeEnabled}
        onClose={() => setShowHintModal(false)}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />

      <LessonSettingsModal
        visible={showSettingsModal}
        voiceModeEnabled={voiceModeEnabled}
        onClose={() => setShowSettingsModal(false)}
        onOpenSettings={() => {
          setShowSettingsModal(false);
          router.replace("/settings");
        }}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />

      <LessonCompleteModal
        visible={showCompletedModal}
        title={title || ""}
        voiceModeEnabled={voiceModeEnabled}
        onClose={() => {
          setShowCompletedModal(false);
          router.back();
        }}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />

      <LessonPromotionModal
        visible={showPromotionModal}
        pendingPromotion={pendingPromotion}
        currentPieceTheme={currentPieceTheme}
        voiceModeEnabled={voiceModeEnabled}
        onPromote={handlePromotion}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />
    </SafeAreaView>
  );
}
