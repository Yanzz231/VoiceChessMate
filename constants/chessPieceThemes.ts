export interface PieceTheme {
  id: string;
  name: string;
  version: "v1" | "v2" | "v3";
}

export const PIECE_THEMES: PieceTheme[] = [
  { id: "classic", name: "Classic", version: "v1" },
  { id: "modern", name: "Modern", version: "v2" },
  { id: "elegant", name: "Elegant", version: "v3" },
];

export const DEFAULT_PIECE_THEME: PieceTheme = PIECE_THEMES[0];
