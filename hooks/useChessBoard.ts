import { Chess } from "chess.js";
import { useCallback, useState } from "react";

interface PendingPromotion {
  from: string;
  to: string;
  color: "w" | "b";
}

type PromotionPiece = "q" | "r" | "b" | "n";

export const useChessBoard = (
  game: Chess,
  onMove?: (move: any, newGame: Chess) => void,
  playerColor: "white" | "black" = "white",
  isInteractable: boolean = true
) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  const isPawnPromotion = useCallback(
    (from: string, to: string): boolean => {
      const piece = game.get(from as any);
      if (!piece || piece.type !== "p") return false;

      const toRank = parseInt(to[1]);
      return (
        (piece.color === "w" && toRank === 8) ||
        (piece.color === "b" && toRank === 1)
      );
    },
    [game]
  );

  const findKingSquare = useCallback(
    (color: "w" | "b"): string | null => {
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
    },
    [game]
  );

  const makeMove = useCallback(
    (from: string, to: string, promotion?: PromotionPiece) => {
      try {
        const move = game.move({
          from: from as any,
          to: to as any,
          promotion: promotion || "q",
        });

        if (move && onMove) {
          const newGame = new Chess(game.fen());
          onMove(move, newGame);
          return move;
        }
        return move;
      } catch (error) {
        return null;
      }
    },
    [game, onMove]
  );

  const handleSquarePress = useCallback(
    (square: string) => {
      if (!isInteractable) return;

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

        const move = makeMove(selectedSquare, square);
        if (move) {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    },
    [
      selectedSquare,
      isInteractable,
      playerColor,
      game,
      isPawnPromotion,
      makeMove,
    ]
  );

  const handlePromotion = useCallback(
    (promotionPiece: PromotionPiece) => {
      if (!pendingPromotion) return;

      const move = makeMove(
        pendingPromotion.from,
        pendingPromotion.to,
        promotionPiece
      );
      if (move) {
        setShowPromotionModal(false);
        setPendingPromotion(null);
      }
    },
    [pendingPromotion, makeMove]
  );

  const getSquareStyle = useCallback(
    (
      square: string,
      rowIndex: number,
      colIndex: number,
      lightSquareColor: string,
      darkSquareColor: string,
      selectedSquareColor: string,
      lastMoveSquareColor: string,
      lastMove?: { from: string; to: string } | null
    ) => {
      const isLight = (rowIndex + colIndex) % 2 === 0;
      const isSelected = selectedSquare === square;
      const isPossibleMove = possibleMoves.includes(square);
      const isLastMoveSquare =
        lastMove && (lastMove.from === square || lastMove.to === square);

      const kingSquare = findKingSquare(game.turn());
      const piece = game.get(square as any);
      const isKingInCheck =
        game.inCheck() &&
        kingSquare === square &&
        piece &&
        piece.type === "k" &&
        piece.color === game.turn();

      let backgroundColor = isLight ? lightSquareColor : darkSquareColor;

      if (isSelected) {
        backgroundColor = selectedSquareColor;
      } else if (isLastMoveSquare) {
        backgroundColor = lastMoveSquareColor;
      } else if (isKingInCheck) {
        backgroundColor = "#ff4444";
      }

      return {
        backgroundColor,
        isSelected,
        isPossibleMove,
        isLastMoveSquare,
        isKingInCheck,
      };
    },
    [selectedSquare, possibleMoves, game, findKingSquare]
  );

  const resetSelection = useCallback(() => {
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, []);

  return {
    selectedSquare,
    possibleMoves,
    pendingPromotion,
    showPromotionModal,
    setShowPromotionModal,
    handleSquarePress,
    handlePromotion,
    getSquareStyle,
    findKingSquare,
    makeMove,
    resetSelection,
  };
};
