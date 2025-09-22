import { CHESS_STORAGE_KEYS } from "@/constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chess } from "chess.js";
import { useCallback, useState } from "react";

interface GameState {
  fen: string;
  moveHistory: string[];
  timestamp: number;
  moveNumber: number;
  turn: "w" | "b";
}

export const useGameState = (initialFEN?: string) => {
  const [game, setGame] = useState(() =>
    initialFEN ? new Chess(initialFEN) : new Chess()
  );
  const [gameStates, setGameStates] = useState<GameState[]>([]);
  const [gameStatus, setGameStatus] = useState<
    "playing" | "checkmate" | "stalemate" | "draw"
  >("playing");
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );

  const initializeGame = useCallback(() => {
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
  }, [initialFEN]);

  const addGameState = useCallback((newGame: Chess) => {
    const newState: GameState = {
      fen: newGame.fen(),
      moveHistory: [...newGame.history()],
      timestamp: Date.now(),
      moveNumber: newGame.history().length,
      turn: newGame.turn(),
    };
    setGameStates((prev) => [...prev, newState]);
  }, []);

  const saveGameState = useCallback(async () => {
    if (initialFEN || gameStates.length === 0) return;

    try {
      await AsyncStorage.setItem(
        CHESS_STORAGE_KEYS.GAME_STATES,
        JSON.stringify(gameStates)
      );
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  }, [gameStates, initialFEN]);

  const loadGameState = useCallback(async (): Promise<boolean> => {
    if (initialFEN) return false;

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
  }, [initialFEN]);

  const checkGameStatus = useCallback(() => {
    if (game.isCheckmate()) {
      setGameStatus("checkmate");
      return "checkmate";
    } else if (game.isStalemate()) {
      setGameStatus("stalemate");
      return "stalemate";
    } else if (game.isDraw()) {
      setGameStatus("draw");
      return "draw";
    } else {
      setGameStatus("playing");
      return "playing";
    }
  }, [game]);

  const undoToPlayerMove = useCallback(
    (playerColor: "white" | "black") => {
      const currentPlayerColor = playerColor === "white" ? "w" : "b";

      if (gameStates.length <= 1) {
        return { success: false, message: "No moves to undo." };
      }

      let targetStateIndex = -1;
      for (let i = gameStates.length - 2; i >= 0; i--) {
        if (gameStates[i].turn === currentPlayerColor) {
          targetStateIndex = i;
          break;
        }
      }

      if (targetStateIndex === -1) {
        return { success: false, message: "No player moves to undo." };
      }

      const targetState = gameStates[targetStateIndex];
      const newGame = new Chess(targetState.fen);
      const newGameStates = gameStates.slice(0, targetStateIndex + 1);

      setGame(newGame);
      setGameStates(newGameStates);
      setGameStatus("playing");
      setLastMove(null);

      return { success: true };
    },
    [gameStates]
  );

  const resetGame = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        CHESS_STORAGE_KEYS.GAME_STATES,
        CHESS_STORAGE_KEYS.CURRENT_STATE_INDEX,
        CHESS_STORAGE_KEYS.GAME_SESSION,
        CHESS_STORAGE_KEYS.DIFFICULTY,
        CHESS_STORAGE_KEYS.COLOR,
        CHESS_STORAGE_KEYS.GAME_FEN,
        "game_id",
      ]);

      const newGame = new Chess();
      setGame(newGame);
      setGameStatus("playing");
      setLastMove(null);

      const initialState: GameState = {
        fen: newGame.fen(),
        moveHistory: [],
        timestamp: Date.now(),
        moveNumber: 0,
        turn: "w",
      };
      setGameStates([initialState]);

      return { success: true };
    } catch (error) {
      console.error("Error resetting game:", error);
      return { success: false, message: "Failed to reset game." };
    }
  }, []);

  return {
    game,
    setGame,
    gameStates,
    setGameStates,
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
  };
};
