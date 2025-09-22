import { userService } from "@/services/userService";
import { Chess } from "chess.js";
import { useCallback } from "react";

export const useChessHints = () => {
  const getHint = useCallback(
    async (
      game: Chess,
      gameStatus: string,
      isWaitingForBot: boolean,
      isProcessingMove: boolean,
      playerColor: "white" | "black"
    ): Promise<{ success: boolean; message: string }> => {
      if (gameStatus !== "playing" || isWaitingForBot || isProcessingMove) {
        return {
          success: false,
          message: "Cannot get hint right now.",
        };
      }

      const currentPlayerColor = playerColor === "white" ? "w" : "b";
      if (game.turn() !== currentPlayerColor) {
        return {
          success: false,
          message: "It's not your turn yet!",
        };
      }

      try {
        const response = await userService.getHint(game.fen());

        if (response.success && response.data?.hint) {
          return {
            success: true,
            message: response.data.hint,
          };
        } else {
          const moves = game.moves({ verbose: true });
          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            return {
              success: true,
              message: `Consider moving from ${randomMove.from} to ${randomMove.to}`,
            };
          } else {
            return {
              success: false,
              message: "No moves available!",
            };
          }
        }
      } catch (error) {
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          return {
            success: true,
            message: `Consider moving from ${randomMove.from} to ${randomMove.to}`,
          };
        } else {
          return {
            success: false,
            message: "Unable to get hint at this time. Please try again.",
          };
        }
      }
    },
    []
  );

  return {
    getHint,
  };
};
