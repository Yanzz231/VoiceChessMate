import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chess } from "chess.js";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BackIcon } from "@/components/BackIcon";
import ChessSettings from "@/components/ChessSettings";
import { PieceRenderer } from "@/components/chess/PieceRenderer";
import { Setting } from "@/components/icons/Setting";
import QuickThemeSelector from "./QuickThemeSelector";
import { FlagIcon } from "./icons/FlagIcon";
import { HintIcon } from "./icons/HintIcon";
import { Mic } from "./icons/Mic";
import { OptionIcon } from "./icons/OptionIcon";
import { UndoIcon } from "./icons/UndoIcon";

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
import { useVoiceChessMove } from "@/hooks/useVoiceChessMove";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { userService } from "@/services/userService";

import { Face } from "@/components/Face";

interface ChessGameProps {
  onQuit: () => void;
  onBack: () => void;
  playerColor: "white" | "black";
  initialFEN?: string;
}

interface GameState {
  fen: string;
  moveHistory: string[];
  timestamp: number;
  moveNumber: number;
  turn: "w" | "b";
}

interface PendingPromotion {
  from: string;
  to: string;
  color: "w" | "b";
}

const { width } = Dimensions.get("window");
const boardSize = width - 64;
const squareSize = boardSize / 8;
const coordinateSize = 16;

type PromotionPiece = "q" | "r" | "b" | "n";

const ChessGame: React.FC<ChessGameProps> = ({
  onQuit,
  onBack,
  playerColor,
  initialFEN,
}) => {
  const [game, setGame] = useState(() =>
    initialFEN ? new Chess(initialFEN) : new Chess()
  );
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [gameStates, setGameStates] = useState<GameState[]>([]);
  const [gameStatus, setGameStatus] = useState<
    "playing" | "checkmate" | "stalemate" | "draw"
  >("playing");
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ChessTheme>(DEFAULT_THEME);
  const [currentPieceTheme, setCurrentPieceTheme] =
    useState<PieceTheme>(DEFAULT_PIECE_THEME);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickThemeSelector, setShowQuickThemeSelector] = useState(false);
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverData, setGameOverData] = useState<{
    type: "checkmate" | "stalemate" | "draw";
    winner?: string;
    message: string;
  } | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const gameRef = useRef(game);

  const handleVoiceMoveComplete = useCallback((move: any, newGame: Chess) => {
    if (move && move.from && move.to) {
      setLastMove({ from: move.from, to: move.to });
    }
    setGame(newGame);
    addGameState(newGame);
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, []);

  const { isProcessingMove, processVoiceMove } = useVoiceChessMove({
    game,
    onMoveComplete: handleVoiceMoveComplete,
  });

  const handleVoiceTranscriptComplete = useCallback(
    async (result: any) => {
      if (result?.text) {
        const transcriptText = result.text.trim();
        await processVoiceMove(transcriptText);
      } else {
        Speech.speak("Command not understood", {
          language: "en-US",
          pitch: 1.0,
          rate: 0.9,
        });
      }
    },
    [processVoiceMove]
  );

  const { handleTouchStart, handleTouchEnd, cleanup } = useVoiceRecording({
    apiKey: "37c72e8e5dd344939db0183d6509ceec",
    language: "id",
    longPressThreshold: 1000,
    onTranscriptComplete: handleVoiceTranscriptComplete,
  });

  useEffect(() => {
    initializeGame();
    loadGameState();
    loadTheme();
    loadPieceTheme();
    loadDifficulty();

    const timer = setTimeout(() => {
      setShowWelcomePopup(true);
      Speech.speak("Thanks for playing chess with me. Good luck!", {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });

      setTimeout(() => {
        setShowWelcomePopup(false);
      }, 4000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    gameRef.current = game;
    saveGameState();
    checkGameStatus();
  }, [game, gameStates]);

  useEffect(() => {
    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    const gameTurn = game.turn();
    const isBotTurn = gameTurn !== currentPlayerColor;

    if (initialFEN && gameStates.length === 1 && game.history().length > 0) {
      return;
    }

    if (
      playerColor === "black" &&
      gameStates.length === 1 &&
      game.history().length === 0 &&
      !initialFEN
    ) {
      setTimeout(() => {
        makeBotMove();
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
        makeBotMove();
      }, 1000);
    }
  }, [
    game,
    gameStatus,
    isWaitingForBot,
    isProcessingMove,
    playerColor,
    gameStates.length,
  ]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (
          showSettings ||
          showQuickThemeSelector ||
          showPromotionModal ||
          showGameOverModal ||
          showWelcomePopup ||
          showQuitModal ||
          showBackModal ||
          showSettingsModal ||
          showOptionsModal ||
          showHintModal ||
          showErrorModal
        ) {
          return false;
        }

        setShowBackModal(true);
        return true;
      }
    );

    return () => backHandler.remove();
  }, [
    showSettings,
    showQuickThemeSelector,
    showPromotionModal,
    showGameOverModal,
    showWelcomePopup,
    showQuitModal,
    showBackModal,
    showSettingsModal,
    showOptionsModal,
    showHintModal,
    showErrorModal,
  ]);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.THEME);
      if (savedThemeId) {
        const theme =
          CHESS_THEMES.find((t) => t.id === savedThemeId) || DEFAULT_THEME;
        setCurrentTheme(theme);
      }
    } catch (error) {}
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
    } catch (error) {}
  };

  const loadDifficulty = async () => {
    try {
      const savedDifficulty = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.DIFFICULTY
      );
      if (savedDifficulty) {
        setDifficulty(savedDifficulty);
      }
    } catch (error) {}
  };

  const handleThemeChange = (theme: ChessTheme) => {
    setCurrentTheme(theme);
  };

  const handlePieceThemeChange = (theme: PieceTheme) => {
    setCurrentPieceTheme(theme);
  };

  const initializeGame = () => {
    const newGame = initialFEN ? new Chess(initialFEN) : new Chess();
    setGame(newGame);
    const initialState: GameState = {
      fen: newGame.fen(),
      moveHistory: newGame.history(),
      timestamp: Date.now(),
      moveNumber: newGame.history().length,
      turn: newGame.turn(),
    };
    setGameStates([initialState]);
  };

  const loadGameState = async (): Promise<boolean> => {
    if (initialFEN) {
      return false;
    }
    try {
      const savedStates = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.GAME_STATES
      );

      if (savedStates) {
        const states = JSON.parse(savedStates);
        setGameStates(states);

        const lastState = states[states.length - 1];
        if (lastState) {
          const newGame = new Chess(lastState.fen);
          setGame(newGame);
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const saveGameState = async () => {
    if (initialFEN) {
      return;
    }
    try {
      if (gameStates.length > 0) {
        await AsyncStorage.setItem(
          CHESS_STORAGE_KEYS.GAME_STATES,
          JSON.stringify(gameStates)
        );
      }
    } catch (error) {}
  };

  const addGameState = (newGame: Chess) => {
    const newState: GameState = {
      fen: newGame.fen(),
      moveHistory: [...newGame.history()],
      timestamp: Date.now(),
      moveNumber: newGame.history().length,
      turn: newGame.turn(),
    };

    setGameStates((prev) => [...prev, newState]);
  };

  const mapDifficultyToBotLevel = (difficulty: string): string => {
    switch (difficulty) {
      case "Beginner":
        return "easy";
      case "Intermediate":
        return "medium";
      case "Advanced":
        return "hard";
      case "Expert":
        return "expert";
      default:
        return "medium";
    }
  };

  const makeBotMove = async () => {
    try {
      setIsWaitingForBot(true);

      if (initialFEN) {
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const move = game.move(randomMove);
          if (move) {
            setLastMove({ from: move.from, to: move.to });
            const newGame = new Chess(game.fen());
            setGame(newGame);
            addGameState(newGame);
          }
        }
        return;
      }

      const gameId = await AsyncStorage.getItem("game_id");
      if (!gameId) {
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const move = game.move(randomMove);
          if (move) {
            setLastMove({ from: move.from, to: move.to });
            const newGame = new Chess(game.fen());
            setGame(newGame);
            addGameState(newGame);
          }
        }
        return;
      }

      const lastMoveHistory = game.history({ verbose: true });
      const lastMove = lastMoveHistory[lastMoveHistory.length - 1];
      const moveString = lastMove ? `${lastMove.from}${lastMove.to}` : "";

      const botLevel = mapDifficultyToBotLevel(difficulty);

      const response = await userService.makeMove(
        gameId,
        moveString,
        game.fen(),
        botLevel
      );

      if (response.success && response.data) {
        const newGame = new Chess(response.data.fen);
        setGame(newGame);
        addGameState(newGame);

        const botMove = response.data.bot_move;
        if (botMove && botMove.length >= 4) {
          const from = botMove.substring(0, 2);
          const to = botMove.substring(2, 4);
          setLastMove({ from, to });
        }
      } else {
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const move = game.move(randomMove);
          if (move) {
            setLastMove({ from: move.from, to: move.to });
            const newGame = new Chess(game.fen());
            setGame(newGame);
            addGameState(newGame);
          }
        }
      }
    } catch (error) {
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const move = game.move(randomMove);
        if (move) {
          setLastMove({ from: move.from, to: move.to });
          const newGame = new Chess(game.fen());
          setGame(newGame);
          addGameState(newGame);
        }
      }
    } finally {
      setIsWaitingForBot(false);
    }
  };

  const checkGameStatus = () => {
    if (game.isCheckmate()) {
      setGameStatus("checkmate");
      handleGameEnd("checkmate");
    } else if (game.isStalemate()) {
      setGameStatus("stalemate");
      handleGameEnd("stalemate");
    } else if (game.isDraw()) {
      setGameStatus("draw");
      handleGameEnd("draw");
    } else {
      setGameStatus("playing");
    }
  };

  const handleGameEnd = (status: string) => {
    let message = "";
    let winner = "";
    const currentWinner = game.turn() === "w" ? "Black" : "White";

    switch (status) {
      case "checkmate":
        message = `${currentWinner} wins by checkmate!`;
        winner = currentWinner;
        break;
      case "stalemate":
        message = "Game ended in stalemate!";
        break;
      case "draw":
        message = "Game ended in a draw!";
        break;
    }

    setGameOverData({
      type: status as "checkmate" | "stalemate" | "draw",
      winner,
      message,
    });

    setTimeout(() => {
      setShowGameOverModal(true);
    }, 1000);
  };

  const findKingSquare = (color: "w" | "b"): string | null => {
    const board = game.board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === "k" && piece.color === color) {
          return String.fromCharCode(97 + col) + (8 - row);
        }
      }
    }
    return null;
  };

  const isPawnPromotion = (from: string, to: string): boolean => {
    const piece = game.get(from as any);
    if (!piece || piece.type !== "p") return false;

    const toRank = parseInt(to[1]);
    return (
      (piece.color === "w" && toRank === 8) ||
      (piece.color === "b" && toRank === 1)
    );
  };

  const handleSquarePress = (square: string) => {
    if (gameStatus !== "playing" || isWaitingForBot || isProcessingMove) return;

    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    if (game.turn() !== currentPlayerColor) return;

    if (selectedSquare === null) {
      const piece = game.get(square as any);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map((move) => move.to));
      }
    } else if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      if (isPawnPromotion(selectedSquare, square)) {
        const piece = game.get(selectedSquare as any);
        setPendingPromotion({
          from: selectedSquare,
          to: square,
          color: piece!.color,
        });
        setShowPromotionModal(true);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      try {
        const move = game.move({
          from: selectedSquare as any,
          to: square as any,
          promotion: "q",
        });

        if (move) {
          setLastMove({ from: selectedSquare, to: square });
          const newGame = new Chess(game.fen());
          setGame(newGame);
          addGameState(newGame);

          setTimeout(() => {
            makeBotMove();
          }, 500);
        }
      } catch (error) {}

      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handlePromotion = (promotionPiece: PromotionPiece) => {
    if (!pendingPromotion) return;

    try {
      const move = game.move({
        from: pendingPromotion.from as any,
        to: pendingPromotion.to as any,
        promotion: promotionPiece,
      });

      if (move) {
        setLastMove({ from: pendingPromotion.from, to: pendingPromotion.to });
        const newGame = new Chess(game.fen());
        setGame(newGame);
        addGameState(newGame);

        setTimeout(() => {
          makeBotMove();
        }, 500);
      }
    } catch (error) {}

    setShowPromotionModal(false);
    setPendingPromotion(null);
  };

  const handleUndo = () => {
    if (isWaitingForBot || gameStates.length <= 1 || isProcessingMove) {
      setErrorMessage("No moves to undo.");
      setShowErrorModal(true);
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
      setErrorMessage("No player moves to undo.");
      setShowErrorModal(true);
      return;
    }

    const targetState = gameStates[targetStateIndex];
    const newGame = new Chess(targetState.fen);

    const newGameStates = gameStates.slice(0, targetStateIndex + 1);

    setGame(newGame);
    setGameStates(newGameStates);
    setGameStatus("playing");
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
  };

  const handleNewGame = async () => {
    try {
      setLoading(true);

      await AsyncStorage.multiRemove([
        CHESS_STORAGE_KEYS.GAME_STATES,
        CHESS_STORAGE_KEYS.CURRENT_STATE_INDEX,
        CHESS_STORAGE_KEYS.GAME_SESSION,
        CHESS_STORAGE_KEYS.DIFFICULTY,
        CHESS_STORAGE_KEYS.COLOR,
        CHESS_STORAGE_KEYS.GAME_FEN,
        "game_id",
      ]);

      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        setErrorMessage("User not found. Please login again.");
        setShowErrorModal(true);
        return;
      }

      const gameId = await userService.createGame(userId);
      if (!gameId) {
        setErrorMessage("Failed to create new game. Please try again.");
        setShowErrorModal(true);
        return;
      }

      await AsyncStorage.setItem("game_id", gameId);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.DIFFICULTY, difficulty);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.COLOR, playerColor);
      await AsyncStorage.setItem(CHESS_STORAGE_KEYS.GAME_SESSION, "active");

      const newGame = new Chess();
      setGame(newGame);
      setGameStatus("playing");
      setSelectedSquare(null);
      setPossibleMoves([]);
      setLastMove(null);
      setIsWaitingForBot(false);
      setShowGameOverModal(false);
      setGameOverData(null);

      const initialState: GameState = {
        fen: newGame.fen(),
        moveHistory: [],
        timestamp: Date.now(),
        moveNumber: 0,
        turn: "w",
      };
      setGameStates([initialState]);

      if (playerColor === "black") {
        setTimeout(() => {
          makeBotMove();
        }, 1000);
      }
    } catch (error) {
      setErrorMessage("Failed to start new game. Please try again.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOption = () => {
    setShowOptionsModal(true);
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  const handleHint = async () => {
    if (gameStatus !== "playing" || isWaitingForBot || isProcessingMove) return;

    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    if (game.turn() !== currentPlayerColor) {
      setHintMessage("It's not your turn yet!");
      setShowHintModal(true);
      return;
    }

    try {
      const response = await userService.getHint(game.fen());

      if (response.success && response.data?.hint) {
        setHintMessage(response.data.hint);
        setShowHintModal(true);
      } else {
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          setHintMessage(
            `Consider moving from ${randomMove.from} to ${randomMove.to}`
          );
          setShowHintModal(true);
        } else {
          setHintMessage("No moves available!");
          setShowHintModal(true);
        }
      }
    } catch (error) {
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        setHintMessage(
          `Consider moving from ${randomMove.from} to ${randomMove.to}`
        );
        setShowHintModal(true);
      } else {
        setHintMessage("Unable to get hint at this time. Please try again.");
        setShowHintModal(true);
      }
    }
  };

  const renderPiece = (piece: any, square: string) => {
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
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    const isLastMoveSquare =
      lastMove && (lastMove.from === square || lastMove.to === square);

    const kingSquare = findKingSquare(game.turn());
    const isKingInCheck =
      game.inCheck() &&
      kingSquare === square &&
      piece &&
      piece.type === "k" &&
      piece.color === game.turn();

    let backgroundColor = isLight
      ? currentTheme.lightSquare
      : currentTheme.darkSquare;

    if (isSelected) {
      backgroundColor = currentTheme.selectedSquare;
    } else if (isLastMoveSquare) {
      backgroundColor = currentTheme.lastMoveSquare;
    } else if (isKingInCheck) {
      backgroundColor = "#ff4444";
    }

    return (
      <TouchableOpacity
        key={square}
        style={{
          width: squareSize,
          height: squareSize,
          backgroundColor,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          opacity: isWaitingForBot || isProcessingMove ? 0.7 : 1,
        }}
        onPress={() => handleSquarePress(square)}
        disabled={isWaitingForBot || isProcessingMove}
      >
        {renderPiece(piece, square)}

        {isPossibleMove && !piece && (
          <View
            style={{
              width: squareSize * 0.3,
              height: squareSize * 0.3,
              borderRadius: squareSize * 0.15,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            }}
          />
        )}

        {isPossibleMove && piece && (
          <View
            style={{
              position: "absolute",
              width: squareSize,
              height: squareSize,
              borderWidth: 3,
              borderColor: "rgba(255, 0, 0, 0.7)",
              borderRadius: 4,
            }}
          />
        )}

        {isKingInCheck && (
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
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderFileLabels = () => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const displayFiles = playerColor === "white" ? files : [...files].reverse();

    return (
      <View
        style={{ flexDirection: "row", justifyContent: "center", marginTop: 4 }}
      >
        <View style={{ width: coordinateSize }} />
        {displayFiles.map((file) => (
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
    const displayRanks = playerColor === "white" ? ranks : [...ranks].reverse();

    return (
      <View style={{ justifyContent: "center", marginRight: 4 }}>
        {displayRanks.map((rank) => (
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
        const actualRow = playerColor === "white" ? row : 7 - row;
        const actualCol = playerColor === "white" ? col : 7 - col;

        const piece = board[actualRow][actualCol];
        const square = String.fromCharCode(97 + actualCol) + (8 - actualRow);

        squares.push(renderSquare(square, piece, row, col));
      }
    }

    return (
      <View style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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

          <View style={{ justifyContent: "center", marginLeft: 4 }}>
            {renderRankLabels().props.children}
          </View>
        </View>

        {renderFileLabels()}
      </View>
    );
  };

  const renderWelcomePopup = () => {
    if (!showWelcomePopup) return null;

    return (
      <Modal visible={showWelcomePopup} transparent={true} animationType="fade">
        <View className="flex-1 justify-start items-center pt-20">
          <View className="relative">
            <View className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white z-10" />

            <View className="bg-white rounded-2xl  p-6  mx-4 max-w-sm w-full border border-gray-100">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full items-center justify-center mr-3">
                  <Face height={70} width={70} />
                </View>
                <Text className="text-lg font-semibold text-gray-800">
                  Albert
                </Text>
              </View>

              <Text className="text-gray-800 text-base leading-relaxed mt-2">
                Thanks for playing chess with me. Good luck!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderQuitModal = () => {
    if (!showQuitModal) return null;

    return (
      <Modal visible={showQuitModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Quit Game
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Are you sure you want to quit? Your game progress will be lost.
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowQuitModal(false);
                  onQuit();
                }}
                className="bg-red-600 py-4 rounded-2xl shadow-lg active:bg-red-700"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Quit Game
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowQuitModal(false)}
                className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-gray-700 text-lg font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderBackModal = () => {
    if (!showBackModal) return null;

    return (
      <Modal visible={showBackModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Quit Game
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Are you sure you want to quit? Your game progress will be lost.
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowBackModal(false);
                  onBack();
                }}
                className="bg-red-600 py-4 rounded-2xl shadow-lg active:bg-red-700"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Quit Game
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowBackModal(false)}
                className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-gray-700 text-lg font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;

    return (
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Open Settings
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Opening settings might affect your current game progress. Are you
              sure you want to continue?
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowSettingsModal(false);
                  setShowSettings(true);
                }}
                className="bg-indigo-600 py-4 rounded-2xl shadow-lg active:bg-indigo-700"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Yes, Open Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSettingsModal(false)}
                className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-gray-700 text-lg font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderOptionsModal = () => {
    if (!showOptionsModal) return null;

    return (
      <Modal visible={showOptionsModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-6">
              Game Options
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowOptionsModal(false);
                  handleNewGame();
                }}
                className="bg-indigo-600 py-4 rounded-2xl shadow-lg active:bg-indigo-700"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  New Game
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowOptionsModal(false);
                  setShowQuickThemeSelector(true);
                }}
                className="bg-green-600 py-4 rounded-2xl shadow-lg active:bg-green-700"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Change Theme
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowOptionsModal(false)}
                className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-gray-700 text-lg font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderHintModal = () => {
    if (!showHintModal) return null;

    return (
      <Modal visible={showHintModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Chess Hint
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6 leading-relaxed">
              {hintMessage}
            </Text>

            <TouchableOpacity
              onPress={() => setShowHintModal(false)}
              className="bg-indigo-600 py-4 rounded-2xl shadow-lg active:bg-indigo-700"
            >
              <Text className="text-white text-lg font-semibold text-center">
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderErrorModal = () => {
    if (!showErrorModal) return null;

    return (
      <Modal visible={showErrorModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Error
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6 leading-relaxed">
              {errorMessage}
            </Text>

            <TouchableOpacity
              onPress={() => setShowErrorModal(false)}
              className="bg-red-600 py-4 rounded-2xl shadow-lg active:bg-red-700"
            >
              <Text className="text-white text-lg font-semibold text-center">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderGameOverModal = () => {
    if (!showGameOverModal || !gameOverData) return null;

    return (
      <Modal
        visible={showGameOverModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-8 shadow-2xl max-w-sm w-full">
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                {gameOverData.type === "checkmate"
                  ? "Game Over!"
                  : "Game Ended"}
              </Text>

              <Text className="text-lg text-gray-700 text-center leading-relaxed">
                {gameOverData.message}
              </Text>

              {gameOverData.winner && (
                <Text className="text-base text-green-600 font-medium mt-2">
                  Congratulations!
                </Text>
              )}
            </View>

            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowGameOverModal(false);
                  handleNewGame();
                }}
                className="bg-indigo-600 py-4 rounded-2xl shadow-lg active:bg-indigo-700"
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {loading ? "Creating new game..." : "New Game"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowGameOverModal(false);
                  onBack();
                }}
                className="bg-gray-100 py-4 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-gray-700 text-lg font-medium text-center">
                  Back to Home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderPromotionModal = () => {
    if (!pendingPromotion) return null;

    const promotionPieces = [
      {
        type: "q",
        name: "Queen",
      },
      {
        type: "r",
        name: "Rook",
      },
      {
        type: "b",
        name: "Bishop",
      },
      {
        type: "n",
        name: "Knight",
      },
    ];

    return (
      <Modal
        visible={showPromotionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white rounded-3xl mx-6 p-6 shadow-2xl">
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Pawn Promotion
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Choose what piece your pawn becomes:
            </Text>

            <View className="flex-row gap-4 justify-around items-center m-4">
              {promotionPieces.map((piece) => {
                return (
                  <TouchableOpacity
                    key={piece.type}
                    onPress={() =>
                      handlePromotion(piece.type as PromotionPiece)
                    }
                    className="items-center p-3 rounded-2xl bg-gray-50 border-2 border-gray-200 active:border-indigo-300"
                    style={{ width: 80, height: 90 }}
                  >
                    <View className="w-12 h-12 justify-center items-center mb-2">
                      <PieceRenderer
                        type={piece.type as any}
                        color={pendingPromotion.color}
                        theme={currentPieceTheme.version}
                        size={48}
                      />
                    </View>
                    <Text className="text-sm font-medium text-gray-700 text-center">
                      {piece.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs text-gray-500 text-center">
              Tap on a piece to promote your pawn
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  if (showSettings) {
    return (
      <ChessSettings
        onBack={() => setShowSettings(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        currentPieceTheme={currentPieceTheme}
        onPieceThemeChange={handlePieceThemeChange}
      />
    );
  }

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-4 pt-14 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setShowBackModal(true)}
            className="w-10 h-10 justify-center items-center"
          >
            <BackIcon height={30} width={30} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-semibold text-gray-800">
              Chess Game
            </Text>
            <Text className="text-sm text-gray-500">
              {isWaitingForBot
                ? "Bot thinking..."
                : isProcessingMove
                ? "Processing voice..."
                : `${currentPlayer} to move`}{" "}
              • {currentTheme.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSettingsPress}
            className="w-10 h-10 justify-center items-center"
          >
            <Setting height={30} width={30} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-medium text-gray-700">
            {gameStatus === "playing"
              ? isWaitingForBot
                ? "Bot is thinking..."
                : isProcessingMove
                ? "Processing voice command..."
                : `${currentPlayer}'s turn`
              : "Game Over"}
          </Text>
          <Text className="text-sm text-gray-500">
            Moves: {gameStates.length - 1} | Turn:{" "}
            {Math.ceil(gameStates.length / 2)}
          </Text>
        </View>
        {game.inCheck() && gameStatus === "playing" && (
          <Text className="text-red-600 font-medium mt-1">Check!</Text>
        )}
      </View>

      <View className="flex-1 justify-center items-center px-4 py-4 bg-gray-100">
        {renderBoard()}
      </View>

      <View className="bg-white px-4 py-6 border-t border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleOption}
            className="items-center flex-1"
            disabled={isVoiceDisabled}
          >
            <View
              className={`w-12 h-12 items-center justify-center mb-2 ${
                isVoiceDisabled ? "opacity-30" : ""
              }`}
            >
              <OptionIcon width={30} height={30} />
            </View>
            <Text
              className={`text-sm font-medium ${
                isVoiceDisabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Option
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowQuitModal(true)}
            className="items-center flex-1"
            disabled={isVoiceDisabled}
          >
            <View
              className={`w-12 h-12 items-center justify-center mb-2 ${
                isVoiceDisabled ? "opacity-30" : ""
              }`}
            >
              <FlagIcon width={30} height={30} />
            </View>
            <Text
              className={`text-sm font-medium ${
                isVoiceDisabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Quit
            </Text>
          </TouchableOpacity>

          <View className="items-center flex-1">
            <TouchableOpacity
              disabled={!currentPlayerTurn || isVoiceDisabled}
              onPressIn={
                currentPlayerTurn && !isVoiceDisabled
                  ? handleTouchStart
                  : undefined
              }
              onPressOut={
                currentPlayerTurn && !isVoiceDisabled
                  ? handleTouchEnd
                  : undefined
              }
              className="items-center"
            >
              <View
                className={`w-16 h-16 ${
                  !currentPlayerTurn || isVoiceDisabled
                    ? "bg-gray-400"
                    : isProcessingMove
                    ? "bg-yellow-500"
                    : "bg-indigo-600"
                } rounded-full items-center justify-center mb-2 shadow-lg`}
              >
                <Mic height={24} width={24} color="white" />
              </View>
              <Text
                className={`text-sm font-medium ${
                  !currentPlayerTurn || isVoiceDisabled
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                {isProcessingMove ? "Processing..." : "Voice"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleHint}
            className="items-center flex-1"
            disabled={isVoiceDisabled}
          >
            <View
              className={`w-12 h-12 items-center justify-center mb-2 ${
                isVoiceDisabled ? "opacity-30" : ""
              }`}
            >
              <HintIcon width={30} height={30} />
            </View>
            <Text
              className={`text-sm font-medium ${
                isVoiceDisabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Hint
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUndo}
            disabled={!canUndo}
            className="items-center flex-1"
          >
            <View
              className={`w-12 h-12 items-center justify-center mb-2 ${
                !canUndo ? "opacity-30" : ""
              }`}
            >
              <UndoIcon width={30} height={30} />
            </View>
            <Text
              className={`text-sm font-medium ${
                !canUndo ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Undo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderWelcomePopup()}
      {renderQuitModal()}
      {renderBackModal()}
      {renderSettingsModal()}
      {renderOptionsModal()}
      {renderHintModal()}
      {renderErrorModal()}
      {renderGameOverModal()}
      {renderPromotionModal()}

      <QuickThemeSelector
        visible={showQuickThemeSelector}
        onClose={() => setShowQuickThemeSelector(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
    </SafeAreaView>
  );
};

export default ChessGame;
