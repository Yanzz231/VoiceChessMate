import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useState } from "react";
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
import { Face } from "@/components/Face";
import { PieceRenderer } from "@/components/chess/PieceRenderer";
import { Setting } from "@/components/icons/Setting";
import QuickThemeSelector from "./QuickThemeSelector";
import { FlagIcon } from "./icons/FlagIcon";
import { HintIcon } from "./icons/HintIcon";
import { Mic } from "./icons/Mic";
import { OptionIcon } from "./icons/OptionIcon";
import { UndoIcon } from "./icons/UndoIcon";

import { useBotMove } from "@/hooks/useBotMove";
import { useChessBoard } from "@/hooks/useChessBoard";
import { useChessHints } from "@/hooks/useChessHints";
import { useChessModals } from "@/hooks/useChessModals";
import { useChessSettings } from "@/hooks/useChessSettings";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import { useGameState } from "@/hooks/useGameState";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useVoiceChess } from "@/hooks/useVoiceChess";

interface ChessGameProps {
  onQuit: () => void;
  onBack: () => void;
  playerColor: "white" | "black";
  initialFEN?: string;
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
  const [difficulty, setDifficulty] = useState("medium");
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickThemeSelector, setShowQuickThemeSelector] = useState(false);

  const {
    currentTheme,
    currentPieceTheme,
    setCurrentTheme,
    setCurrentPieceTheme,
    loadAllSettings,
  } = useChessSettings();

  const {
    game,
    setGame,
    gameStates,
    gameStatus,
    lastMove,
    setLastMove,
    initializeGame,
    addGameState,
    saveGameState,
    loadGameState,
    checkGameStatus,
    undoToPlayerMove,
    resetGame,
  } = useGameState(initialFEN);

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
    pendingPromotion,
    showPromotionModal,
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

  const {
    showWelcomePopup,
    setShowWelcomePopup,
    showQuitModal,
    setShowQuitModal,
    showBackModal,
    setShowBackModal,
    showSettingsModal,
    setShowSettingsModal,
    showOptionsModal,
    setShowOptionsModal,
    showHintModal,
    setShowHintModal,
    showErrorModal,
    setShowErrorModal,
    showGameOverModal,
    setShowGameOverModal,
    hintMessage,
    errorMessage,
    gameOverData,
    showHint,
    showError,
    showGameOver,
    isAnyModalOpen,
  } = useChessModals();

  const { loadGameSettings } = useGameStorage();
  const { getHint } = useChessHints();
  const { loading, createNewGame } = useGameInitialization();

  useEffect(() => {
    initializeGame();
    loadGameState();
    loadAllSettings();
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
    saveGameState();
    const status = checkGameStatus();
    if (status !== "playing") {
      handleGameEnd(status);
    }
  }, [game, gameStates]);

  useEffect(() => {
    const currentPlayerColor = playerColor === "white" ? "w" : "b";
    const isBotTurn = game.turn() !== currentPlayerColor;

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
    } else if (initialFEN && isBotTurn && gameStates.length === 1) {
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
          isAnyModalOpen() ||
          showSettings ||
          showQuickThemeSelector ||
          showPromotionModal
        ) {
          return false;
        }
        setShowBackModal(true);
        return true;
      }
    );

    return () => backHandler.remove();
  }, [
    isAnyModalOpen,
    showSettings,
    showQuickThemeSelector,
    showPromotionModal,
  ]);

  const loadDifficulty = async () => {
    const settings = await loadGameSettings();
    if (settings?.difficulty) {
      setDifficulty(settings.difficulty);
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

    showGameOver({
      type: status as "checkmate" | "stalemate" | "draw",
      winner,
      message,
    });
  };

  const handleUndo = () => {
    if (isWaitingForBot || gameStates.length <= 1 || isProcessingMove) {
      showError("No moves to undo.");
      return;
    }

    const result = undoToPlayerMove(playerColor);
    if (!result.success) {
      showError(result.message || "Cannot undo move.");
    }
  };

  const handleNewGame = async () => {
    const result = await createNewGame({
      difficulty,
      playerColor,
    });

    if (!result.success) {
      showError(result.message || "Failed to create new game.");
      return;
    }

    await resetGame();

    if (playerColor === "black") {
      setTimeout(() => {
        makeBotMove({
          game,
          difficulty,
          onMoveComplete: handleMoveComplete,
        });
      }, 1000);
    }
  };

  const handleHintRequest = async () => {
    const result = await getHint(
      game,
      gameStatus,
      isWaitingForBot,
      isProcessingMove,
      playerColor
    );
    showHint(result.message);
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
        onPress={() => handleSquarePress(square)}
        disabled={isWaitingForBot || isProcessingMove}
      >
        {renderPiece(piece, square)}

        {squareStyle.isPossibleMove && !piece && (
          <View
            style={{
              width: squareSize * 0.3,
              height: squareSize * 0.3,
              borderRadius: squareSize * 0.15,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            }}
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
            <View className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full border border-gray-100">
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
      { type: "q", name: "Queen" },
      { type: "r", name: "Rook" },
      { type: "b", name: "Bishop" },
      { type: "n", name: "Knight" },
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
              {promotionPieces.map((piece) => (
                <TouchableOpacity
                  key={piece.type}
                  onPress={() => handlePromotion(piece.type as PromotionPiece)}
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
              ))}
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
        onThemeChange={setCurrentTheme}
        currentPieceTheme={currentPieceTheme}
        onPieceThemeChange={setCurrentPieceTheme}
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
            onPress={() => setShowSettingsModal(true)}
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
            onPress={() => setShowOptionsModal(true)}
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
            onPress={handleHintRequest}
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
        onThemeChange={setCurrentTheme}
      />
    </SafeAreaView>
  );
};

export default ChessGame;
