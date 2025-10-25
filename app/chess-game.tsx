import { Chess } from "chess.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  SafeAreaView,
  ScrollView,
  View,
  Vibration,
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
import { USER_STORAGE_KEYS } from "@/constants/storageKeys";
import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";

export default function ChessGameScreen() {
  const {
    fromScan,
    fen: scannedFen,
    selectedColor: scannedColor,
  } = useLocalSearchParams<{
    fromScan?: string;
    fen?: string;
    selectedColor?: string;
  }>();

  const [showHintModal, setShowHintModal] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Array<{ moveNumber: number; white: string; black?: string }>>([]);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [initialFEN, setInitialFEN] = useState<string | undefined>(undefined);

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
    initialFEN || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );

  const handleMoveComplete = useCallback(
    (move: any, newGame: any) => {
      if (move && move.from && move.to) {
        setLastMove({ from: move.from, to: move.to });
      }
      setGame(newGame);
      addGameState(newGame);
      resetSelection();

      // Save game state to AsyncStorage
      saveGameToStorage(newGame);

      // Update move history manually by tracking each move
      if (move && move.san) {
        setMoveHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          const totalMoves = prevHistory.reduce((sum, m) => sum + (m.black ? 2 : 1), 0);
          const isWhiteMove = totalMoves % 2 === 0;

          if (isWhiteMove) {
            // White's move - create new entry
            newHistory.push({
              moveNumber: Math.floor(totalMoves / 2) + 1,
              white: move.san,
            });
          } else {
            // Black's move - update last entry
            const lastEntry = newHistory[newHistory.length - 1];
            if (lastEntry) {
              lastEntry.black = move.san;
            }
          }

          return newHistory;
        });
      }

      // Announce check or checkmate
      if (voiceModeEnabled) {
        setTimeout(() => {
          const playerInCheck = newGame.turn() === "w" ? "White" : "Black";
          if (newGame.isCheckmate()) {
            speak(`Checkmate! ${playerInCheck} is checkmated!`);
          } else if (newGame.inCheck()) {
            speak(`Check! ${playerInCheck} is in check!`);
          }
        }, 500);
      }
    },
    [setGame, addGameState, setLastMove, voiceModeEnabled]
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
    playerColor,
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
    loadGameSession();
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const status = checkGameStatus();
    if (status !== "playing") {
      handleGameComplete(status);
    }
  }, [game, gameStates.length]);

  useEffect(() => {
    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    const isBotTurn = game.turn() !== currentPlayerColor;

    // Handle bot's first move if player is black
    if (
      playerColor === "black" &&
      gameStates.length === 1 &&
      game.history().length === 0
    ) {
      setTimeout(() => {
        makeBotMove({
          game,
          difficulty,
          initialFEN,
          onMoveComplete: handleMoveComplete,
        });
      }, 1000);
    }
    // Handle bot's first move from scanned position
    else if (initialFEN && isBotTurn && gameStates.length === 1) {
      setTimeout(() => {
        makeBotMove({
          game,
          difficulty,
          initialFEN,
          onMoveComplete: handleMoveComplete,
        });
      }, 1000);
    }
  }, [gameStates.length, playerColor, game, initialFEN]);

  useEffect(() => {
    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    const isBotTurn = game.turn() !== currentPlayerColor;

    if (initialFEN && isProcessingMove) return;

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
          difficulty,
          initialFEN,
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

  const loadGameSession = async () => {
    try {
      // Load voice mode preference
      const voiceMode = await AsyncStorage.getItem(USER_STORAGE_KEYS.VOICE_MODE);
      const isEnabled = voiceMode === "true" || voiceMode === true;
      setVoiceModeEnabled(isEnabled);

      // Check if loading from scan
      if (fromScan === "true" && scannedFen) {
        const color = (scannedColor as "white" | "black") || "white";
        setPlayerColor(color);
        setInitialFEN(scannedFen);
        setDifficulty("medium");

        // Save to storage
        await saveMultipleValues([
          [CHESS_STORAGE_KEYS.GAME_FEN, scannedFen],
          [CHESS_STORAGE_KEYS.DIFFICULTY, "medium"],
          [CHESS_STORAGE_KEYS.COLOR, color],
          [CHESS_STORAGE_KEYS.GAME_SESSION, "active"],
        ]);

        if (isEnabled) {
          setTimeout(() => {
            speak(`Chess game started. You are playing as ${color}.`);
          }, 1000);
        }
      } else {
        // Load existing game session
        const savedFen = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.GAME_FEN);
        const savedDifficulty = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.DIFFICULTY);
        const savedColor = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.COLOR);

        if (savedFen) {
          setInitialFEN(savedFen);
        }
        if (savedDifficulty) {
          setDifficulty(savedDifficulty);
        }
        if (savedColor) {
          setPlayerColor(savedColor as "white" | "black");
        }

        if (isEnabled) {
          setTimeout(() => {
            speak(`Welcome back! Continuing your chess game.`);
          }, 1000);
        }
      }

      initializeGame();
    } catch (error) {
      // Error loading game session
    }
  };

  const saveGameToStorage = async (currentGame: any) => {
    try {
      const fen = currentGame.fen();
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_FEN, fen);

      // Save to saved games list
      const gameId = await AsyncStorage.getItem("game_id");
      if (gameId) {
        const savedGamesJson = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.SAVED_GAMES);
        let savedGames = savedGamesJson ? JSON.parse(savedGamesJson) : [];

        const existingGameIndex = savedGames.findIndex((g: any) => g.id === gameId);

        const gameData = {
          id: gameId,
          name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Game`,
          fen: fen,
          difficulty: difficulty,
          playerColor: playerColor,
          lastPlayed: new Date().toISOString(),
          gameStates: gameStates,
        };

        if (existingGameIndex >= 0) {
          // Update existing game
          savedGames[existingGameIndex] = gameData;
        } else {
          // Add new game
          savedGames.push(gameData);
        }

        await AsyncStorage.setItem(CHESS_STORAGE_KEYS.SAVED_GAMES, JSON.stringify(savedGames));
      }
    } catch (error) {
      // Error saving game
    }
  };

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

  const handleGameComplete = async (status: string) => {
    try {
      const currentPlayerColor = playerColor === "white" ? "w" : "b";
      const isPlayerWinner = status === "checkmate" && game.turn() !== currentPlayerColor;

      let message = "";
      if (status === "checkmate") {
        message = isPlayerWinner ? "Congratulations! You won!" : "Game over. You lost.";
      } else if (status === "stalemate") {
        message = "Game ended in a stalemate.";
      } else if (status === "draw") {
        message = "Game ended in a draw.";
      }

      setTimeout(() => {
        setShowCompletedModal(true);
        if (voiceModeEnabled) {
          speak(message);
        }
      }, 1000);
    } catch (error) {
      // Error handling game completion
    }
  };

  const handleHintRequest = async () => {
    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    const result = await getHint(
      game,
      gameStatus,
      isWaitingForBot,
      isProcessingMove,
      playerColor
    );
    setHintMessage(result.message);
    setShowHintModal(true);
  };

  const handleUndo = () => {
    if (isWaitingForBot || gameStates.length <= 1 || isProcessingMove) {
      Alert.alert("Cannot Undo", "No moves to undo.");
      return;
    }

    const currentPlayerColor = playerColor === "white" ? "w" : "b";
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

    const newGame = new Chess(targetState.fen);
    setGame(newGame);
    setGameStates(newGameStates);
    resetSelection();
    setLastMove(null);

    // Save updated state
    saveGameToStorage(newGame);

    // Update move history after undo
    const newMoveCount = newGameStates.length - 1;
    const movesToRemove = Math.ceil(newMoveCount / 2);
    setMoveHistory((prevHistory) => prevHistory.slice(0, movesToRemove));
  };

  const handleSquareTap = (square: string, piece: any) => {
    Vibration.vibrate(50);

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

  const handleQuitGame = async () => {
    try {
      // Clear game session
      await saveMultipleValues([
        [CHESS_STORAGE_KEYS.GAME_SESSION, ""],
      ]);

      setShowBackModal(false);
      router.replace("/home");
    } catch (error) {
      router.replace("/home");
    }
  };

  const currentPlayer = game.turn() === "w" ? "White" : "Black";
  const currentPlayerColor = playerColor === "white" ? "w" : "b";

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
        title={`Chess Game - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`}
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
          objective={`Playing as ${playerColor} against ${difficulty} bot`}
          isInCheck={game.inCheck()}
          voiceModeEnabled={voiceModeEnabled}
          onTextPress={(text) => voiceModeEnabled && speak(text)}
        />

        {!showHistoryView ? (
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
          </View>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}>
            <MoveHistory moves={moveHistory} voiceModeEnabled={voiceModeEnabled} />
          </View>
        )}
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
        onHistoryPress={() => {
          setShowHistoryView(!showHistoryView);
          if (voiceModeEnabled) {
            speak(showHistoryView ? "Showing board" : "Showing move history");
          }
        }}
        showHistoryView={showHistoryView}
      />

      <LessonBackModal
        visible={showBackModal}
        voiceModeEnabled={voiceModeEnabled}
        onClose={() => setShowBackModal(false)}
        onQuit={handleQuitGame}
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
          router.push({ pathname: "/profile", params: { tab: "themes" } });
        }}
        onTextPress={(text) => voiceModeEnabled && speak(text)}
      />

      <LessonCompleteModal
        visible={showCompletedModal}
        title="Game Complete"
        voiceModeEnabled={voiceModeEnabled}
        onClose={() => {
          setShowCompletedModal(false);
          router.replace("/home");
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
