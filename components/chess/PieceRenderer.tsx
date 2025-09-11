import React from "react";
import { BishopV1 } from "./ChessBishopV1";
import { BishopV2 } from "./ChessBishopV2";
import { BishopV3 } from "./ChessBishopV3";
import { HorseV1 } from "./ChessHorseV1";
import { HorseV2 } from "./ChessHorseV2";
import { HorseV3 } from "./ChessHorseV3";
import { KingV1 } from "./ChessKingV1";
import { KingV2 } from "./ChessKingV2";
import { KingV3 } from "./ChessKingV3";
import { PawnV1 } from "./ChessPawnV1";
import { PawnV2 } from "./ChessPawnV2";
import { PawnV3 } from "./ChessPawnV3";
import { QueenV1 } from "./ChessQueenV1";
import { QueenV2 } from "./ChessQueenV2";
import { QueenV3 } from "./ChessQueenV3";
import { RookV1 } from "./ChessRookV1";
import { RookV2 } from "./ChessRookV2";
import { RookV3 } from "./ChessRookV3";

interface PieceRendererProps {
  type: "p" | "r" | "n" | "b" | "q" | "k";
  color: "w" | "b";
  theme: "v1" | "v2" | "v3";
  size: number;
}

export const PieceRenderer: React.FC<PieceRendererProps> = ({
  type,
  color,
  theme,
  size,
}) => {
  const fillColor = color === "w" ? "#FFFFFF" : "#000000";
  const strokeColor = color === "w" ? "#000000" : "#FFFFFF";

  const props = {
    width: size,
    height: size,
    color: theme === "v1" ? strokeColor : fillColor,
  };

  if (theme === "v1") {
    switch (type) {
      case "p":
        return <PawnV1 {...props} />;
      case "r":
        return <RookV1 {...props} />;
      case "n":
        return <HorseV1 {...props} />;
      case "b":
        return <BishopV1 {...props} />;
      case "q":
        return <QueenV1 {...props} />;
      case "k":
        return <KingV1 {...props} />;
      default:
        return null;
    }
  } else if (theme === "v2") {
    switch (type) {
      case "p":
        return <PawnV2 {...props} />;
      case "r":
        return <RookV2 {...props} />;
      case "n":
        return <HorseV2 {...props} />;
      case "b":
        return <BishopV2 {...props} />;
      case "q":
        return <QueenV2 {...props} />;
      case "k":
        return <KingV2 {...props} />;
      default:
        return null;
    }
  } else {
    switch (type) {
      case "p":
        return <PawnV3 {...props} />;
      case "r":
        return <RookV3 {...props} />;
      case "n":
        return <HorseV3 {...props} />;
      case "b":
        return <BishopV3 {...props} />;
      case "q":
        return <QueenV3 {...props} />;
      case "k":
        return <KingV3 {...props} />;
      default:
        return null;
    }
  }
};
