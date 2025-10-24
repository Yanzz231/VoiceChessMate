import * as FileSystem from 'expo-file-system';

export interface BoardCorners {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export interface SquareDetection {
  square: string;
  hasPiece: boolean;
  pieceType?: string;
  pieceColor?: 'white' | 'black';
  confidence: number;
}

export interface DetectionResult {
  boardDetected: boolean;
  corners?: BoardCorners;
  confidence: number;
  gridLines?: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  squareDetections?: SquareDetection[];
}

export class ChessBoardDetectionService {
  private static readonly API_URL = 'https://fastapi-production-079a.up.railway.app/occ';

  static async detectBoardInRealtime(
    imageUri: string
  ): Promise<DetectionResult> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'chess_board.jpg',
      } as any);

      const response = await fetch(
        `${this.API_URL}/detect-board?realtime=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        return {
          boardDetected: false,
          confidence: 0,
        };
      }

      const data = await response.json();
      return this.parseDetectionResponse(data);
    } catch (error) {
      console.error('Real-time board detection error:', error);
      return {
        boardDetected: false,
        confidence: 0,
      };
    }
  }

  static async detectBoardWithOpenCV(imageUri: string): Promise<DetectionResult> {
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(
        `${this.API_URL}/opencv-detect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            detectGrid: true,
            detectCorners: true,
            detectPieces: true,
          }),
        }
      );

      if (!response.ok) {
        return this.fallbackLocalDetection(imageUri);
      }

      const data = await response.json();
      return this.parseDetectionResponse(data);
    } catch (error) {
      console.error('OpenCV board detection error:', error);
      return this.fallbackLocalDetection(imageUri);
    }
  }

  private static parseDetectionResponse(data: any): DetectionResult {
    if (!data || !data.board_detected) {
      return {
        boardDetected: false,
        confidence: 0,
      };
    }

    const corners = data.corners
      ? {
          topLeft: { x: data.corners.tl.x, y: data.corners.tl.y },
          topRight: { x: data.corners.tr.x, y: data.corners.tr.y },
          bottomLeft: { x: data.corners.bl.x, y: data.corners.bl.y },
          bottomRight: { x: data.corners.br.x, y: data.corners.br.y },
        }
      : undefined;

    const gridLines = data.grid_lines
      ? data.grid_lines.map((line: any) => ({
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2,
        }))
      : undefined;

    const squareDetections = data.pieces
      ? data.pieces.map((piece: any) => ({
          square: piece.square,
          hasPiece: piece.has_piece,
          pieceType: piece.piece_type,
          pieceColor: piece.piece_color,
          confidence: piece.confidence || 0.7,
        }))
      : undefined;

    return {
      boardDetected: true,
      corners,
      confidence: data.confidence || 0.8,
      gridLines,
      squareDetections,
    };
  }

  private static async fallbackLocalDetection(imageUri: string): Promise<DetectionResult> {
    console.log('Using fallback local detection');
    return {
      boardDetected: false,
      confidence: 0,
    };
  }

  static calculateBoardBoundingBox(
    corners: BoardCorners,
    imageWidth: number,
    imageHeight: number
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const minX = Math.min(
      corners.topLeft.x,
      corners.bottomLeft.x,
      corners.topRight.x,
      corners.bottomRight.x
    );
    const maxX = Math.max(
      corners.topLeft.x,
      corners.bottomLeft.x,
      corners.topRight.x,
      corners.bottomRight.x
    );
    const minY = Math.min(
      corners.topLeft.y,
      corners.bottomLeft.y,
      corners.topRight.y,
      corners.bottomRight.y
    );
    const maxY = Math.max(
      corners.topLeft.y,
      corners.bottomLeft.y,
      corners.topRight.y,
      corners.bottomRight.y
    );

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  static isValidChessBoard(corners: BoardCorners): boolean {
    const width1 = this.distance(corners.topLeft, corners.topRight);
    const width2 = this.distance(corners.bottomLeft, corners.bottomRight);
    const height1 = this.distance(corners.topLeft, corners.bottomLeft);
    const height2 = this.distance(corners.topRight, corners.bottomRight);

    const widthRatio = Math.min(width1, width2) / Math.max(width1, width2);
    const heightRatio = Math.min(height1, height2) / Math.max(height1, height2);
    const aspectRatio = Math.min(width1, width2) / Math.min(height1, height2);

    return (
      widthRatio > 0.85 &&
      heightRatio > 0.85 &&
      aspectRatio > 0.85 &&
      aspectRatio < 1.15
    );
  }

  private static distance(
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
}
