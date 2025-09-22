import { userService } from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chess } from "chess.js";
import { useCallback, useState } from "react";

interface BotMoveOptions {
  game: Chess;
  difficulty: string;
  initialFEN?: string;
  onMoveComplete?: (move: any, newGame: Chess) => void;
}

export const useBotMove = () => {
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);

  const mapDifficultyToBotLevel = useCallback((difficulty: string): string => {
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
  }, []);

  const makeRandomMove = useCallback((game: Chess) => {
    const moves = game.moves({ verbose: true });
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      const move = game.move(randomMove);
      if (move) {
        return {
          move,
          from: move.from,
          to: move.to,
          newGame: new Chess(game.fen()),
        };
      }
    }
    return null;
  }, []);

  const makeBotMove = useCallback(
    async ({
      game,
      difficulty,
      initialFEN,
      onMoveComplete,
    }: BotMoveOptions) => {
      try {
        setIsWaitingForBot(true);

        if (initialFEN) {
          const result = makeRandomMove(game);
          if (result && onMoveComplete) {
            onMoveComplete(result.move, result.newGame);
          }
          return result;
        }

        const gameId = await AsyncStorage.getItem("game_id");
        if (!gameId) {
          const result = makeRandomMove(game);
          if (result && onMoveComplete) {
            onMoveComplete(result.move, result.newGame);
          }
          return result;
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
          const botMove = response.data.bot_move;
          let moveResult = null;

          if (botMove && botMove.length >= 4) {
            const from = botMove.substring(0, 2);
            const to = botMove.substring(2, 4);
            moveResult = { from, to };
          }

          if (onMoveComplete) {
            onMoveComplete(moveResult, newGame);
          }

          return { move: moveResult, newGame };
        } else {
          const result = makeRandomMove(game);
          if (result && onMoveComplete) {
            onMoveComplete(result.move, result.newGame);
          }
          return result;
        }
      } catch (error) {
        console.error("Bot move error:", error);
        const result = makeRandomMove(game);
        if (result && onMoveComplete) {
          onMoveComplete(result.move, result.newGame);
        }
        return result;
      } finally {
        setIsWaitingForBot(false);
      }
    },
    [mapDifficultyToBotLevel, makeRandomMove]
  );

  return {
    isWaitingForBot,
    makeBotMove,
    makeRandomMove,
  };
};
