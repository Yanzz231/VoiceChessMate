export interface ChessTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquare: string;
  lastMoveSquare: string;
  preview: {
    light: string;
    dark: string;
  };
}

export const CHESS_THEMES: ChessTheme[] = [
  {
    id: "classic",
    name: "Classic",
    lightSquare: "#f0d9b5",
    darkSquare: "#b58863",
    selectedSquare: "#9acd32",
    lastMoveSquare: "#9acd32",
    preview: {
      light: "#f0d9b5",
      dark: "#b58863",
    },
  },
  {
    id: "blue",
    name: "Ocean Blue",
    lightSquare: "#e8f4f8",
    darkSquare: "#4a90b8",
    selectedSquare: "#7fb3d3",
    lastMoveSquare: "#5fa8d3",
    preview: {
      light: "#e8f4f8",
      dark: "#4a90b8",
    },
  },
  {
    id: "green",
    name: "Forest Green",
    lightSquare: "#f0f8e8",
    darkSquare: "#6b8e23",
    selectedSquare: "#9acd32",
    lastMoveSquare: "#8fbc8f",
    preview: {
      light: "#f0f8e8",
      dark: "#6b8e23",
    },
  },
  {
    id: "purple",
    name: "Royal Purple",
    lightSquare: "#f8f0ff",
    darkSquare: "#6a4c93",
    selectedSquare: "#9d7bbe",
    lastMoveSquare: "#8a6fb0",
    preview: {
      light: "#f8f0ff",
      dark: "#6a4c93",
    },
  },
  {
    id: "pink",
    name: "Rose Pink",
    lightSquare: "#fff0f5",
    darkSquare: "#c2185b",
    selectedSquare: "#f06292",
    lastMoveSquare: "#e91e63",
    preview: {
      light: "#fff0f5",
      dark: "#c2185b",
    },
  },
  {
    id: "orange",
    name: "Sunset Orange",
    lightSquare: "#fff8e1",
    darkSquare: "#f57c00",
    selectedSquare: "#ffb74d",
    lastMoveSquare: "#ffa726",
    preview: {
      light: "#fff8e1",
      dark: "#f57c00",
    },
  },
  {
    id: "teal",
    name: "Teal Ocean",
    lightSquare: "#e0f2f1",
    darkSquare: "#00695c",
    selectedSquare: "#4db6ac",
    lastMoveSquare: "#26a69a",
    preview: {
      light: "#e0f2f1",
      dark: "#00695c",
    },
  },
  {
    id: "dark",
    name: "Dark Mode",
    lightSquare: "#3c3c3c",
    darkSquare: "#1a1a1a",
    selectedSquare: "#555555",
    lastMoveSquare: "#444444",
    preview: {
      light: "#3c3c3c",
      dark: "#1a1a1a",
    },
  },
];

export const DEFAULT_THEME = CHESS_THEMES[0];
