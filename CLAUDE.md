# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ChessMate (VoiceMate Chess)** is a React Native mobile application built with Expo that enables visually impaired users to play chess through voice commands. The app provides an inclusive, accessible chess experience with text-to-speech feedback and voice-controlled gameplay.

## Development Commands

### Basic Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Build Commands
- Use Expo EAS for builds (configuration in `eas.json`)
- Android package: `com.andrianpratama05.samsungvoice`

## Tech Stack

- **Framework**: React Native 0.79.5 with Expo 53
- **Router**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Chess Engine**: chess.js
- **Backend**: Supabase (authentication, database)
- **Voice Services**:
  - `@react-native-voice/voice` for real-time speech recognition
  - `expo-speech` for text-to-speech
- **State Management**: React hooks with AsyncStorage for persistence

## Architecture

### Routing Structure (`app/` directory)
The app uses Expo Router with file-based routing:
- `_layout.tsx` - Root layout with auth guard (redirects to `/login` if not authenticated)
- `index.tsx` - Landing page
- `login.tsx` - Google Sign-In authentication
- `home.tsx` - Main menu after login
- `play.tsx` - Game setup screen
- `chess-game.tsx` - Main chess gameplay screen
- `scan.tsx` - Camera-based chess position scanning
- `analyze.tsx` - Game analysis features
- `lesson.tsx` - Chess lessons
- `settings.tsx` - App settings
- `lesson-detail/[lessonId].tsx` - Dynamic lesson detail page
- `lesson-game/[courseId].tsx` - Dynamic lesson game page
- `game-detail/[gameId].tsx` - Dynamic game detail page

### Authentication Flow
1. Authentication handled by Supabase with Google Sign-In
2. Session stored in AsyncStorage (`supabase_session`)
3. `useAuth()` hook manages auth state globally
4. Protected routes redirect to `/login` if unauthenticated

### Chess Game Architecture

The chess game is heavily modularized with custom hooks:

**Core Game Management:**
- `useGameState` - Manages chess.js instance, game states history, move validation
- `useChessBoard` - Handles board interactions, piece selection, move highlighting
- `useBotMove` - Bot opponent logic with difficulty levels (Beginner/Intermediate/Advanced/Expert)
- `useGameStorage` - Persists game state to AsyncStorage

**Voice Integration:**
- `useVoiceChess` - Main voice chess orchestration
- `useVoiceRecording` - Records audio on long press
- `useVoiceChessMove` - Processes voice commands into chess moves
- `useSpeechService` - Interfaces with speech-to-text service

**UI & Modals:**
- `useChessModals` - Manages all modal states (quit, settings, hints, errors, game over)
- `useChessSettings` - Theme and piece style settings
- `useChessHints` - Provides move suggestions

**Game Features:**
- `useGameInitialization` - Creates new games via backend API
- `useExitHandler` - Handles back button/exit confirmations

### Voice Command Processing

1. User long-presses microphone button → `useVoiceRecording` starts real-time listening
2. `@react-native-voice/voice` captures speech in real-time (no recording required)
3. Transcript processed by `useVoiceChessMove` to extract chess moves
4. Move validated and executed via chess.js
5. Bot responds with counter-move via `useBotMove`
6. Both player and bot moves announced via `expo-speech` TTS

### Services

**VoiceService** (`services/VoiceService.ts`):
- Real-time speech-to-text using `@react-native-voice/voice`
- Supports multiple languages (default: "id-ID" for Indonesian)
- Provides both final results and partial results for real-time feedback
- No API keys or authentication required

**SpeechService** (`services/SpeechService.ts`):
- Legacy service for audio-to-text via external API (still available if needed)
- Converts audio (Uint8Array) to text via POST to `/v2/speech-to-text`
- Requires Bearer token (from Supabase auth)

**userService** (`services/userService.ts`):
- Communicates with backend for game management
- Creates games, makes moves, retrieves game history

### Component Organization

**Chess Piece Rendering:**
- Three visual themes: v1, v2, v3
- Each piece type has separate components per theme: `ChessPawnV1`, `ChessPawnV2`, `ChessPawnV3`, etc.
- `PieceRenderer` component selects appropriate piece component based on theme

**Theming:**
- Board themes defined in `constants/chessThemes.ts`
- Piece themes defined in `constants/chessPieceThemes.ts`
- Settings persisted to AsyncStorage via `useChessSettings`

### State Persistence

**AsyncStorage Keys** (see `constants/storageKeys.ts`):
- `game_state` - Current chess game FEN and history
- `game_id` - Active game ID for backend sync
- `supabase_session` - Authentication session
- `chess_theme` / `chess_piece_theme` - Visual preferences
- `game_settings` - Difficulty and other game configs

### Path Aliases

The project uses `@/*` alias mapping to root directory (configured in `tsconfig.json`). Always use `@/` imports:
```typescript
import { useAuth } from "@/hooks/useAuth";
import { SpeechService } from "@/services/SpeechService";
```

## Key Implementation Details

### Bot Move Integration

The bot move system has two modes:
1. **Online mode**: Uses `userService.makeMove()` to get moves from backend API
2. **Offline/Fallback mode**: Makes random legal moves locally

The backend expects moves in algebraic notation (e.g., "e2e4") and returns new FEN + bot move.

### Voice Command Format

Voice commands should specify moves in natural language:
- Indonesian: "Pion dari e2 ke e4"
- English: "Pawn from e2 to e4"

The `useVoiceChessMove` hook parses these into chess.js move format.

### Game State Management

Game states are stored as an array to support undo functionality. The `undoToPlayerMove()` function intelligently rewinds to the last human player move (skipping bot moves).

### Permission Requirements

The app requires extensive permissions (configured in `app.json`):
- Camera (for position scanning)
- Microphone (for voice commands)
- Speech recognition
- Storage (for saving photos)

## Testing & Debugging

- No automated tests configured
- Use Expo development client for testing native features
- Speech services require valid authentication token
- Bot moves require internet connection for online mode

## Development Rules

### UI Changes
- **DO NOT modify existing UI/styling** unless explicitly requested
- Preserve all existing component layouts, colors, spacing, and visual design
- Only add new UI elements when necessary for new features

### Code Comments
- **DO NOT use emojis** in comments or code
- Add brief, concise comments only for functions that lack documentation
- Keep comments short and to the point - explain what the function does, not how it works
- Example: `// Validates chess move and updates game state` not `// This function takes the move object and then validates it against the current game state and if valid it updates...`

### Function Naming Convention
- **Use clear, descriptive names** - Function names should clearly describe what they do
- **Use camelCase** for function names (e.g., `handleUserLogin`, `validateInput`)
- **Use action verbs** - Start with verbs like `get`, `set`, `handle`, `fetch`, `update`, `validate`, `calculate`
- **Be specific** - Avoid vague names like `doStuff`, `process`, `manage`, `helper`
- **Keep it concise** - Don't use overly long names, but be descriptive enough

**Good Examples:**
```typescript
const handleUserLogin = () => { ... }
const fetchUserProfile = async () => { ... }
const validateEmailFormat = (email: string) => { ... }
const calculateTotalScore = (moves: number) => { ... }
const updateGameState = (newState: GameState) => { ... }
```

**Bad Examples:**
```typescript
const doStuff = () => { ... }  // Too vague
const xyz = () => { ... }  // Meaningless
const theFunction = () => { ... }  // Not descriptive
const processTheThing = () => { ... }  // Unclear
const handleClick123 = () => { ... }  // Poor naming with numbers
```

## Asset Management

### Asset Directory Structure
All assets should be placed in the correct directories following Expo conventions:

```
assets/
├── images/
│   ├── icon.png          # App icon (512x512 or higher recommended)
│   ├── splash.png        # Splash screen image (412x412, 103KB)
│   ├── logo.png          # App logo for in-app use
│   └── favicon.png       # Web favicon
└── fonts/               # Custom fonts if needed
```

### Adding New Assets
1. **Images** → Place in `assets/images/`
2. **Splash Screen** → Use `assets/images/splash.png` (configured in app.json)
3. **Icons** → SVG components in `components/icons/`
4. **Naming Convention** → Use kebab-case for files: `splash-screen.png`, `user-avatar.png`

### Splash Screen Configuration
- File: `assets/images/splash.png`
- Size: 412x412 pixels (103KB)
- Background color: `#F4D03F` (yellow theme)
- Resize mode: `contain`
- **Do not create custom splash components** - Expo handles splash natively via app.json

## Important Notes

- The Supabase credentials in `lib/supabaseClient.ts` are committed (consider moving to environment variables)
- The app targets Android primarily (package: `com.andrianpratama05.samsungvoice`)
- Uses React 19.0.0 with React Native new architecture enabled
- NativeWind v4 for styling - use Tailwind class names in `className` prop
