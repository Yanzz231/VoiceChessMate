import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chess } from "chess.js";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import { userService } from "@/services/userService";

interface ChessGameProps {
  onQuit: () => void;
  onBack: () => void;
  playerColor: "white" | "black";
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
}) => {
  const [game, setGame] = useState(() => new Chess());
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
  const gameRef = useRef(game);

  useEffect(() => {
    initializeGame();
    loadGameState();
    loadTheme();
    loadPieceTheme();
    loadDifficulty();
  }, []);

  useEffect(() => {
    gameRef.current = game;
    saveGameState();
    checkGameStatus();
  }, [game, gameStates]);

  useEffect(() => {
    if (
      playerColor === "black" &&
      gameStates.length === 1 &&
      game.history().length === 0
    ) {
      setTimeout(() => {
        makeBotMove();
      }, 1000);
    }
  }, [gameStates.length, playerColor, game]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (
          showSettings ||
          showQuickThemeSelector ||
          showPromotionModal ||
          showGameOverModal
        ) {
          return false;
        }

        Alert.alert(
          "Quit Game",
          "Are you sure you want to quit? Your game progress will be lost.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Quit",
              style: "destructive",
              onPress: onBack,
            },
          ]
        );
        return true;
      }
    );

    return () => backHandler.remove();
  }, [
    showSettings,
    showQuickThemeSelector,
    showPromotionModal,
    showGameOverModal,
    onBack,
  ]);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(CHESS_STORAGE_KEYS.THEME);
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

  const loadDifficulty = async () => {
    try {
      const savedDifficulty = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.DIFFICULTY
      );
      if (savedDifficulty) {
        setDifficulty(savedDifficulty);
      }
    } catch (error) {
      console.error("Error loading difficulty:", error);
    }
  };

  const handleThemeChange = (theme: ChessTheme) => {
    setCurrentTheme(theme);
  };

  const handlePieceThemeChange = (theme: PieceTheme) => {
    setCurrentPieceTheme(theme);
  };

  const initializeGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    const initialState: GameState = {
      fen: newGame.fen(),
      moveHistory: [],
      timestamp: Date.now(),
      moveNumber: 0,
      turn: "w",
    };
    setGameStates([initialState]);
  };

  const loadGameState = async (): Promise<boolean> => {
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
      console.error("Error loading game state:", error);
      return false;
    }
  };

  const saveGameState = async () => {
    try {
      if (gameStates.length > 0) {
        await AsyncStorage.setItem(
          CHESS_STORAGE_KEYS.GAME_STATES,
          JSON.stringify(gameStates)
        );
      }
    } catch (error) {
      console.error("Error saving game state:", error);
    }
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

      const gameId = await AsyncStorage.getItem("game_id");
      if (!gameId) {
        throw new Error("Game ID not found");
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
        throw new Error(response.message || "Bot move failed");
      }
    } catch (error) {
      console.error("Bot move error:", error);
      Alert.alert("Error", "Bot could not make a move. Please try again.");
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
    if (gameStatus !== "playing" || isWaitingForBot) return;

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
      } catch (error) {
        console.log("Invalid move:", error);
      }

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
    } catch (error) {
      console.log("Invalid promotion:", error);
    }

    setShowPromotionModal(false);
    setPendingPromotion(null);
  };

  const handleUndo = () => {
    if (isWaitingForBot || gameStates.length <= 1) {
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
        Alert.alert("Error", "User not found. Please login again.");
        return;
      }

      const gameId = await userService.createGame(userId);
      if (!gameId) {
        Alert.alert("Error", "Failed to create new game. Please try again.");
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
      console.error("Error starting new game:", error);
      Alert.alert("Error", "Failed to start new game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOption = () => {
    Alert.alert("Game Options", "Choose an option", [
      { text: "New Game", onPress: handleNewGame },
      { text: "Change Theme", onPress: () => setShowQuickThemeSelector(true) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSettingsPress = () => {
    Alert.alert(
      "Open Settings",
      "Opening settings might affect your current game progress. Are you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Open Settings",
          style: "default",
          onPress: () => setShowSettings(true),
        },
      ]
    );
  };

  const handleHint = () => {
    if (gameStatus !== "playing" || isWaitingForBot) return;

    const moves = game.moves({ verbose: true });
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      Alert.alert(
        "Hint",
        `Consider moving from ${randomMove.from} to ${randomMove.to}`
      );
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

    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    const kingSquare = findKingSquare(currentPlayerColor);
    const isKingInCheck =
      game.inCheck() &&
      kingSquare === square &&
      piece &&
      piece.type === "k" &&
      piece.color === currentPlayerColor;

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
          opacity: isWaitingForBot ? 0.7 : 1,
        }}
        onPress={() => handleSquarePress(square)}
        disabled={isWaitingForBot}
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
                    className="items-center p-3 rounded-2xl bg-gray-50 border-2 border-gray-200  active:border-indigo-300"
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
    if (isWaitingForBot || gameStatus !== "playing" || gameStates.length <= 1) {
      return false;
    }

    for (let i = gameStates.length - 2; i >= 0; i--) {
      if (gameStates[i].turn === currentPlayerColor) {
        return true;
      }
    }
    return false;
  })();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-4 pt-14 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 justify-center items-center"
          >
            <BackIcon height={30} width={30} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-semibold text-gray-800">
              Chess Game
            </Text>
            <Text className="text-sm text-gray-500">
              {isWaitingForBot ? "Bot thinking..." : `${currentPlayer} to move`}{" "}
              • {currentTheme.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleSettingsPress()}
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
            disabled={isWaitingForBot}
          >
            <View
              className={`w-12 h-12 items-center justify-center mb-2 ${
                isWaitingForBot ? "opacity-30" : ""
              }`}
            >
              <OptionIcon width={30} height={30} />
            </View>
            <Text
              className={`text-sm font-medium ${
                isWaitingForBot ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Option
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onQuit}
            className="items-center flex-1"
            disabled={isWaitingForBot}
          >
            <View
              className={`w-12 h-12 items-center justify-center mb-2 ${
                isWaitingForBot ? "opacity-30" : ""
              }`}
            >
              <FlagIcon width={30} height={30} />
            </View>
            <Text
              className={`text-sm font-medium ${
                isWaitingForBot ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Quit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center flex-1"
            disabled={isWaitingForBot}
          >
            <View
              className={`w-16 h-16 ${
                isWaitingForBot ? "bg-gray-400" : "bg-indigo-600"
              } rounded-full items-center justify-center mb-2 shadow-lg`}
            >
              <Mic height={24} width={24} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHint}
            className="items-center flex-1"
            disabled={isWaitingForBot}
          >
            <View
              className={`w-12 h-12 items-center justify-center mb-2 ${
                isWaitingForBot ? "opacity-30" : ""
              }`}
            >
              <HintIcon width={30} height={30} />
            </View>
            <Text
              className={`text-sm font-medium ${
                isWaitingForBot ? "text-gray-300" : "text-gray-600"
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
