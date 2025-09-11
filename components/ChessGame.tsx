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

interface ChessGameProps {
  onQuit: () => void;
  onBack: () => void;
  playerColor: "white" | "black";
}

interface GameState {
  fen: string;
  moveHistory: string[];
  timestamp: number;
}

interface PendingPromotion {
  from: string;
  to: string;
  color: "w" | "b";
}

const { width } = Dimensions.get("window");
const boardSize = width - 32;
const squareSize = boardSize / 8;

type PromotionPiece = "q" | "r" | "b" | "n";

const CustomChessGame: React.FC<ChessGameProps> = ({
  onQuit,
  onBack,
  playerColor,
}) => {
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [gameStates, setGameStates] = useState<GameState[]>([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
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
  const gameRef = useRef(game);

  useEffect(() => {
    initializeGame();
    loadGameState();
    loadTheme();
    loadPieceTheme();
  }, []);

  useEffect(() => {
    gameRef.current = game;
    saveGameState();
    checkGameStatus();
  }, [game]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showSettings || showQuickThemeSelector || showPromotionModal) {
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
  }, [showSettings, showQuickThemeSelector, showPromotionModal, onBack]);

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

  const handleThemeChange = (theme: ChessTheme) => {
    setCurrentTheme(theme);
  };

  const handlePieceThemeChange = (theme: PieceTheme) => {
    setCurrentPieceTheme(theme);
  };

  const initializeGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    addGameState(newGame.fen(), []);
  };

  const loadGameState = async (): Promise<boolean> => {
    try {
      const savedStates = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.GAME_STATES
      );
      const savedIndex = await AsyncStorage.getItem(
        CHESS_STORAGE_KEYS.CURRENT_STATE_INDEX
      );

      if (savedStates && savedIndex) {
        const states = JSON.parse(savedStates);
        const index = parseInt(savedIndex);

        setGameStates(states);
        setCurrentStateIndex(index);

        const currentState = states[index];
        if (currentState) {
          const newGame = new Chess(currentState.fen);
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
        await AsyncStorage.setItem(
          CHESS_STORAGE_KEYS.CURRENT_STATE_INDEX,
          currentStateIndex.toString()
        );
      }
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  const addGameState = (fen: string, moveHistory: string[]) => {
    const newState: GameState = {
      fen,
      moveHistory: [...moveHistory],
      timestamp: Date.now(),
    };

    setGameStates((prev) => {
      const newStates = prev.slice(0, currentStateIndex + 1);
      newStates.push(newState);
      return newStates;
    });

    setCurrentStateIndex((prev) => prev + 1);
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
    const winner = game.turn() === "w" ? "Black" : "White";

    switch (status) {
      case "checkmate":
        message = `Game Over! ${winner} wins by checkmate.`;
        break;
      case "stalemate":
        message = "Game ended in stalemate!";
        break;
      case "draw":
        message = "Game ended in a draw!";
        break;
    }

    setTimeout(() => {
      Alert.alert("Game Over", message, [
        { text: "New Game", onPress: handleNewGame },
        { text: "Quit", onPress: onQuit },
      ]);
    }, 1000);
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
    if (gameStatus !== "playing") return;

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
          addGameState(game.fen(), game.history());
          setGame(new Chess(game.fen()));
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
        addGameState(game.fen(), game.history());
        setGame(new Chess(game.fen()));
      }
    } catch (error) {
      console.log("Invalid promotion:", error);
    }

    setShowPromotionModal(false);
    setPendingPromotion(null);
  };

  const handleUndo = () => {
    if (currentStateIndex <= 0) {
      Alert.alert("Cannot Undo", "No previous moves to undo.");
      return;
    }

    const newIndex = currentStateIndex - 1;
    const previousState = gameStates[newIndex];

    setCurrentStateIndex(newIndex);
    const newGame = new Chess(previousState.fen);
    setGame(newGame);
    setGameStatus("playing");
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
  };

  const handleNewGame = async () => {
    try {
      await AsyncStorage.multiRemove([
        CHESS_STORAGE_KEYS.GAME_STATES,
        CHESS_STORAGE_KEYS.CURRENT_STATE_INDEX,
        CHESS_STORAGE_KEYS.GAME_SESSION,
        CHESS_STORAGE_KEYS.DIFFICULTY,
        CHESS_STORAGE_KEYS.COLOR,
        CHESS_STORAGE_KEYS.GAME_FEN,
      ]);

      const newGame = new Chess();
      setGame(newGame);
      setGameStates([]);
      setCurrentStateIndex(0);
      setGameStatus("playing");
      setSelectedSquare(null);
      setPossibleMoves([]);
      setLastMove(null);
      addGameState(newGame.fen(), []);
    } catch (error) {
      console.error("Error starting new game:", error);
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
    if (gameStatus !== "playing") return;

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

    let backgroundColor = isLight
      ? currentTheme.lightSquare
      : currentTheme.darkSquare;

    if (isSelected) {
      backgroundColor = currentTheme.selectedSquare;
    } else if (isLastMoveSquare) {
      backgroundColor = currentTheme.lastMoveSquare;
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
        }}
        onPress={() => handleSquarePress(square)}
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
      </TouchableOpacity>
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
  const canUndo = currentStateIndex > 0;

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
              {currentPlayer} to move • {currentTheme.name}
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
            {gameStatus === "playing" ? `${currentPlayer}'s turn` : "Game Over"}
          </Text>
          <Text className="text-sm text-gray-500">
            Moves: {gameStates.length} | States: {currentStateIndex + 1}/
            {gameStates.length}
          </Text>
        </View>
        {game.inCheck() && gameStatus === "playing" && (
          <Text className="text-red-600 font-medium mt-1">Check!</Text>
        )}
      </View>

      <View className="flex-1 justify-center items-center px-4 py-4 bg-gray-100">
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {renderBoard()}
        </View>
      </View>

      <View className="bg-white px-4 py-6 border-t border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleOption}
            className="items-center flex-1"
          >
            <View className="w-12 h-12 items-center justify-center mb-2">
              <OptionIcon width={30} height={30} />
            </View>
            <Text className="text-sm font-medium text-gray-600">Option</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onQuit} className="items-center flex-1">
            <View className="w-12 h-12 items-center justify-center mb-2">
              <FlagIcon width={30} height={30} />
            </View>
            <Text className="text-sm font-medium text-gray-600">Quit</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center flex-1">
            <View className="w-16 h-16 bg-indigo-600 rounded-full items-center justify-center mb-2 shadow-lg">
              <Mic height={24} width={24} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHint}
            className="items-center flex-1"
          >
            <View className="w-12 h-12 items-center justify-center mb-2">
              <HintIcon width={30} height={30} />
            </View>
            <Text className="text-sm font-medium text-gray-600">Hint</Text>
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

export default CustomChessGame;
