import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Chessboard, { ChessboardRef } from "react-native-chessboard";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { BackIcon } from "@/components/BackIcon";
import { Setting } from "@/components/icons/Setting";
import { FlagIcon } from "./icons/FlagIcon";
import { HintIcon } from "./icons/HintIcon";
import { Mic } from "./icons/Mic";
import { OptionIcon } from "./icons/OptionIcon";
import { UndoIcon } from "./icons/UndoIcon";

interface ChessGameProps {
  onQuit: () => void;
  onBack: () => void;
}

interface GameState {
  fen: string;
  moveHistory: string[];
  timestamp: number;
}

const STORAGE_KEYS = {
  GAME_STATES: "chess_game_states",
  CURRENT_STATE_INDEX: "chess_current_state_index",
};

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessGame({ onQuit, onBack }: ChessGameProps) {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameStates, setGameStates] = useState<GameState[]>([
    { fen: INITIAL_FEN, moveHistory: [], timestamp: Date.now() },
  ]);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<
    "playing" | "checkmate" | "stalemate" | "draw"
  >("playing");
  const chessboardRef = useRef<ChessboardRef>(null);

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    saveGameState();
  }, [gameStates, currentStateIndex]);

  const loadGameState = async () => {
    try {
      const savedStates = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATES);
      const savedIndex = await AsyncStorage.getItem(
        STORAGE_KEYS.CURRENT_STATE_INDEX
      );

      if (savedStates && savedIndex) {
        const states = JSON.parse(savedStates);
        const index = parseInt(savedIndex);

        setGameStates(states);
        setCurrentStateIndex(index);

        const currentState = states[index];
        if (currentState) {
          setFen(currentState.fen);
          setMoveHistory(currentState.moveHistory);
        }
      }
    } catch (error) {
      console.error("Error loading game state:", error);
    }
  };

  const saveGameState = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.GAME_STATES,
        JSON.stringify(gameStates)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_STATE_INDEX,
        currentStateIndex.toString()
      );
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  const addGameState = (newFen: string, newMoveHistory: string[]) => {
    const newState: GameState = {
      fen: newFen,
      moveHistory: [...newMoveHistory],
      timestamp: Date.now(),
    };

    const newStates = gameStates.slice(0, currentStateIndex + 1);
    newStates.push(newState);

    setGameStates(newStates);
    setCurrentStateIndex(newStates.length - 1);
  };

  const handleMove = ({ state }: { state: any }) => {
    if (!state || !state.fen) return;

    const newFen = state.fen;
    setFen(newFen);

    let newMoveHistory = [...moveHistory];

    if (
      state.history &&
      Array.isArray(state.history) &&
      state.history.length > 0
    ) {
      newMoveHistory = state.history.map((move: any) => move.san || move);
      setMoveHistory(newMoveHistory);
    } else if (state.move) {
      const moveNotation = state.move.san || state.move;
      newMoveHistory = [...moveHistory, moveNotation];
      setMoveHistory(newMoveHistory);
    } else {
      newMoveHistory = [...moveHistory, `Move${moveHistory.length + 1}`];
      setMoveHistory(newMoveHistory);
    }

    addGameState(newFen, newMoveHistory);

    if (state.game_over) {
      if (state.in_checkmate) {
        setGameStatus("checkmate");
        handleGameEnd("checkmate");
      } else if (state.in_stalemate) {
        setGameStatus("stalemate");
        handleGameEnd("stalemate");
      } else if (state.in_draw) {
        setGameStatus("draw");
        handleGameEnd("draw");
      }
    }
  };

  const handleGameEnd = (status: string) => {
    let message = "";
    const currentPlayer = fen.split(" ")[1] === "w" ? "Black" : "White";

    switch (status) {
      case "checkmate":
        message = `Game Over! ${currentPlayer} wins by checkmate.`;
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
        {
          text: "New Game",
          onPress: handleNewGame,
        },
        {
          text: "Quit",
          onPress: onQuit,
        },
      ]);
    }, 1000);
  };

  const handleNewGame = async () => {
    try {
      const initialState: GameState = {
        fen: INITIAL_FEN,
        moveHistory: [],
        timestamp: Date.now(),
      };

      setFen(INITIAL_FEN);
      setMoveHistory([]);
      setGameStates([initialState]);
      setCurrentStateIndex(0);
      setGameStatus("playing");

      await AsyncStorage.multiRemove([
        STORAGE_KEYS.GAME_STATES,
        STORAGE_KEYS.CURRENT_STATE_INDEX,
      ]);

      if (chessboardRef.current) {
        chessboardRef.current.resetBoard(INITIAL_FEN);
      }
    } catch (error) {
      console.error("Error starting new game:", error);
    }
  };

  const handleUndo = () => {
    if (currentStateIndex <= 0) {
      Alert.alert("Cannot Undo", "No previous moves to undo.");
      return;
    }

    const newIndex = currentStateIndex - 1;
    const previousState = gameStates[newIndex];

    setCurrentStateIndex(newIndex);
    setFen(previousState.fen);
    setMoveHistory(previousState.moveHistory);
    setGameStatus("playing");

    if (chessboardRef.current) {
      chessboardRef.current.resetBoard(previousState.fen);
    }
  };

  const handleHint = () => {
    Alert.alert(
      "Hint",
      "Analyze the board position and look for tactical opportunities!"
    );
  };

  const handleOption = () => {
    Alert.alert("Options", "Game options and settings", [
      { text: "New Game", onPress: handleNewGame },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const canUndo = currentStateIndex > 0;
  const currentPlayer = fen.split(" ")[1] === "w" ? "White" : "Black";
  const moveCount = Math.ceil((moveHistory?.length || 0) / 2);
  const lastMove =
    moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                {currentPlayer} to move
              </Text>
            </View>
            <TouchableOpacity
              onPress={onQuit}
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
                ? `${currentPlayer}'s turn`
                : "Game Over"}
            </Text>
            <Text className="text-sm text-gray-500">
              Moves: {moveHistory?.length || 0} | States:{" "}
              {currentStateIndex + 1}/{gameStates.length}
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-4">
          <View className="bg-white rounded-lg shadow-lg">
            <Chessboard
              ref={chessboardRef}
              fen={fen}
              onMove={handleMove}
              gestureEnabled={gameStatus === "playing"}
            />
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
