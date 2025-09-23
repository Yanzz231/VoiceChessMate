import { userService } from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chess, Square } from "chess.js";
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";

interface BotMoveOptions {
  game: Chess;
  difficulty: string;
  initialFEN?: string;
  onMoveComplete?: (move: any, newGame: Chess) => void;
  enableAudio?: boolean;
}

interface AudioSettings {
  enableTTS?: boolean;
  language?: string;
  pitch?: number;
  rate?: number;
}

export const useBotMove = (audioSettings?: AudioSettings) => {
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);

  const defaultAudioSettings: AudioSettings = {
    enableTTS: true,
    language: "en-US",
    pitch: 1.0,
    rate: 0.8,
    ...audioSettings,
  };

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

  const getPieceName = useCallback((pieceType: string): string => {
    const pieceNames: { [key: string]: string } = {
      p: "pawn",
      n: "knight",
      b: "bishop",
      r: "rook",
      q: "queen",
      k: "king",
    };
    return pieceNames[pieceType.toLowerCase()] || "piece";
  }, []);

  const announceBotMove = useCallback(
    (from: string, to: string, game: Chess, isCapture: boolean = false) => {
      if (!defaultAudioSettings.enableTTS) return;

      try {
        const piece = game.get(to as Square);
        const pieceName = piece ? getPieceName(piece.type) : "piece";

        let moveText = "";

        if (defaultAudioSettings.language?.startsWith("id")) {
          if (isCapture) {
            moveText = `Bot mengambil dengan ${pieceName} dari ${from} ke ${to}`;
          } else {
            moveText = `Bot memindahkan ${pieceName} dari ${from} ke ${to}`;
          }
        } else {
          if (isCapture) {
            moveText = `Bot captures with ${pieceName} from ${from} to ${to}`;
          } else {
            moveText = `Bot moves ${pieceName} from ${from} to ${to}`;
          }
        }

        if (game.isCheck()) {
          moveText += defaultAudioSettings.language?.startsWith("id")
            ? ", cek!"
            : ", check!";
        }

        if (game.isCheckmate()) {
          moveText += ", checkmate!";
        }

        Speech.speak(moveText, {
          language: "en-US",
          pitch: 1.0,
          rate: 0.7,
          volume: 1.0,
        });
      } catch (error) {
        console.warn("Could not announce move:", error);
      }
    },
    [defaultAudioSettings, getPieceName]
  );

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
          isCapture: !!move.captured,
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
      enableAudio = true,
    }: BotMoveOptions) => {
      try {
        setIsWaitingForBot(true);

        let result = null;

        if (initialFEN) {
          result = makeRandomMove(game);
        } else {
          const gameId = await AsyncStorage.getItem("game_id");

          if (!gameId) {
            result = makeRandomMove(game);
          } else {
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

              if (botMove && botMove.length >= 4) {
                const from = botMove.substring(0, 2);
                const to = botMove.substring(2, 4);

                const oldPiece = game.get(to as Square);
                const isCapture = !!oldPiece;

                const moveResult = {
                  from,
                  to,
                  isCapture,
                  piece: newGame.get(to as Square),
                };

                if (enableAudio) {
                  setTimeout(() => {
                    announceBotMove(from, to, newGame, isCapture);
                  }, 300);
                }

                if (onMoveComplete) {
                  onMoveComplete(moveResult, newGame);
                }

                return { move: moveResult, newGame };
              }
            } else {
              result = makeRandomMove(game);
            }
          }
        }

        if (result && enableAudio) {
          setTimeout(() => {
            announceBotMove(
              result.from,
              result.to,
              result.newGame,
              result.isCapture
            );
          }, 300);
        }

        if (result && onMoveComplete) {
          onMoveComplete(result.move, result.newGame);
        }

        return result;
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
    [mapDifficultyToBotLevel, makeRandomMove, announceBotMove]
  );

  const stopSpeech = useCallback(() => {
    Speech.stop();
  }, []);

  return {
    isWaitingForBot,
    makeBotMove,
    makeRandomMove,
    stopSpeech,
    audioSettings: defaultAudioSettings,
  };
};
