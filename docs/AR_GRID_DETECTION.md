# AR Chess Grid Detection

## Overview
Fitur AR (Augmented Reality) Grid Overlay yang menampilkan kotak-kotak 8x8 secara real-time di atas papan catur fisik dan mendeteksi pieces di setiap square.

## Cara Kerja

### 1. Board Detection
- Sistem mendeteksi 4 corner papan catur menggunakan OpenCV
- Corner points: `topLeft`, `topRight`, `bottomLeft`, `bottomRight`
- Validasi aspect ratio untuk memastikan board berbentuk persegi

### 2. Grid Overlay
- Setelah board terdeteksi, sistem menampilkan 64 kotak (8x8 grid)
- Grid mengikuti perspektif papan (tidak harus lurus)
- Setiap square diberi label koordinat (a1-h8)

### 3. Piece Detection
- Setiap square dianalisis untuk mendeteksi piece
- Backend mengembalikan:
  - `hasPiece`: boolean - apakah ada piece di square ini
  - `pieceType`: string - jenis piece (pawn, knight, bishop, rook, queen, king)
  - `pieceColor`: 'white' | 'black'
  - `confidence`: 0.0 - 1.0

### 4. Visual Feedback

#### Square Colors:
- **Light squares** (putih): `rgba(245, 222, 179, 0.3)` - coklat muda transparan
- **Dark squares** (hitam): `rgba(139, 69, 19, 0.3)` - coklat tua transparan
- **Square with white piece**: `rgba(255, 255, 255, 0.5)` - putih transparan
- **Square with black piece**: `rgba(0, 0, 0, 0.5)` - hitam transparan

#### Borders:
- Normal square: `rgba(255, 255, 255, 0.4)` dengan strokeWidth 1
- Square dengan piece: Yellow border (`WCAGColors.primary.yellow`) dengan strokeWidth 2

#### Piece Labels:
- Piece type ditampilkan sebagai huruf di tengah square
- Font: 12px, bold, yellow color
- Contoh: "P" untuk pawn, "N" untuk knight, "K" untuk king

#### Board Outline:
- Green border (`WCAGColors.semantic.success`) dengan strokeWidth 3
- Mengelilingi seluruh board yang terdeteksi

#### Status Badge:
- Badge di atas board dengan animasi pulse
- Menampilkan: "Board Locked - X pieces"
- X = jumlah pieces yang terdeteksi

## Components

### ChessGridOverlay.tsx
Component utama untuk rendering AR grid overlay.

**Props:**
```typescript
interface ChessGridOverlayProps {
  boardDetected: boolean;
  corners?: BoardCorners;
  squareDetections?: SquareDetection[];
}
```

**Key Functions:**
- `getSquarePosition(row, col)`: Menghitung posisi square berdasarkan perspektif board
- `getSquareSize()`: Menghitung ukuran square berdasarkan width board
- `getSquareDetection(file, rank)`: Mendapatkan detection data untuk square tertentu
- `renderGrid()`: Render 64 squares dengan SVG

**Rendering Logic:**
1. Jika board tidak terdeteksi → show "Looking for chess board..." message
2. Jika board terdeteksi → render 64 squares dengan:
   - Background color (light/dark)
   - Border (normal/highlighted)
   - Piece label (jika ada)
   - File labels (a-h) di bawah
   - Rank labels (1-8) di samping

## Backend API Integration

### Endpoint: `/opencv-detect`
**Request Body:**
```json
{
  "image": "base64_image_data",
  "detectGrid": true,
  "detectCorners": true,
  "detectPieces": true
}
```

**Response:**
```json
{
  "board_detected": true,
  "confidence": 0.85,
  "corners": {
    "tl": { "x": 100, "y": 150 },
    "tr": { "x": 500, "y": 150 },
    "bl": { "x": 100, "y": 550 },
    "br": { "x": 500, "y": 550 }
  },
  "pieces": [
    {
      "square": "e2",
      "has_piece": true,
      "piece_type": "pawn",
      "piece_color": "white",
      "confidence": 0.92
    },
    {
      "square": "e7",
      "has_piece": true,
      "piece_type": "pawn",
      "piece_color": "black",
      "confidence": 0.88
    }
  ]
}
```

## Real-time Detection Flow

1. **Camera Ready** → Start detection interval (1000ms)
2. **Every 1 second:**
   - Take low-quality photo (quality: 0.3)
   - Send to backend API with `detectPieces: true`
   - Parse response
   - Update state:
     - `boardDetected`
     - `boardCorners`
     - `squareDetections[]`
3. **Render:**
   - ChessGridOverlay component receives updated state
   - Render 64 squares with perspective transformation
   - Highlight squares with pieces
   - Show piece labels

## Perspective Transformation

Grid squares mengikuti perspektif papan catur yang mungkin miring atau rotated.

**Formula:**
```typescript
// For square at (row, col):
const rowRatio = row / 8;
const colRatio = col / 8;

// Interpolate top edge
const topX = topLeft.x + (topRight.x - topLeft.x) * colRatio;
const topY = topLeft.y + (topRight.y - topLeft.y) * colRatio;

// Interpolate bottom edge
const bottomX = bottomLeft.x + (bottomRight.x - bottomLeft.x) * colRatio;
const bottomY = bottomLeft.y + (bottomRight.y - bottomLeft.y) * colRatio;

// Final position
const x = topX + (bottomX - topX) * rowRatio;
const y = topY + (bottomY - topY) * rowRatio;
```

## Visual Examples

### Before Board Detection:
```
┌──────────────────────────────┐
│                              │
│  📷 Looking for chess board  │
│  Point camera at board       │
│                              │
└──────────────────────────────┘
```

### After Board Detection (No Pieces):
```
┌────────────────────────────────┐
│ 🟢 Board Locked - 0 pieces    │
├─┬─┬─┬─┬─┬─┬─┬─┐               │
│8│░│ │░│ │░│ │░│ │               │
├─┼─┼─┼─┼─┼─┼─┼─┤               │
│7│ │░│ │░│ │░│ │░│               │
├─┼─┼─┼─┼─┼─┼─┼─┤               │
│6│░│ │░│ │░│ │░│ │               │
│ ... (8x8 grid)                │
└─┴─┴─┴─┴─┴─┴─┴─┘               │
  a b c d e f g h                │
└────────────────────────────────┘
```

### After Board Detection (With Pieces):
```
┌────────────────────────────────┐
│ 🟢 Board Locked - 32 pieces   │
├─┬─┬─┬─┬─┬─┬─┬─┐               │
│8│R│N│B│Q│K│B│N│R│ (black)      │
├─┼─┼─┼─┼─┼─┼─┼─┤               │
│7│P│P│P│P│P│P│P│P│ (black)      │
├─┼─┼─┼─┼─┼─┼─┼─┤               │
│6│ │ │ │ │ │ │ │ │               │
│ ...                           │
│2│P│P│P│P│P│P│P│P│ (white)      │
├─┼─┼─┼─┼─┼─┼─┼─┤               │
│1│R│N│B│Q│K│B│N│R│ (white)      │
└─┴─┴─┴─┴─┴─┴─┴─┘               │
  a b c d e f g h                │
└────────────────────────────────┘

Legend:
- Yellow border = piece detected
- Letter = piece type (P=Pawn, N=Knight, etc)
- Background shade = piece color (white/black)
```

## Performance Optimizations

1. **Low Quality Images**: Quality 0.3 untuk mengurangi beban upload/processing
2. **Skip Processing**: Jika ada error, frame di-skip tanpa stop detection
3. **Interval 1 detik**: Balance antara responsiveness dan battery usage
4. **SVG Rendering**: Lebih performant daripada React Native Views
5. **Conditional Rendering**: Grid hanya render jika `boardDetected === true`

## Troubleshooting

### Grid tidak muncul
- Pastikan board terdeteksi (check corners)
- Pastikan lighting cukup baik
- Pastikan seluruh board visible di camera

### Grid tidak align dengan board
- Backend mungkin mengembalikan corner coordinates yang salah
- Coba adjust camera angle
- Pastikan board tidak terlalu miring (max 30 derajat)

### Pieces tidak terdeteksi
- Backend piece detection mungkin belum implemented
- Confidence threshold terlalu tinggi
- Pieces terlalu kecil atau blur di foto

### Performance issues
- Kurangi detection interval (default: 1000ms → 2000ms)
- Kurangi image quality lebih lanjut (0.3 → 0.2)
- Disable piece detection jika tidak diperlukan

## Future Improvements

1. **Live FEN Display**: Show FEN notation di bawah status badge
2. **Move Validation**: Highlight invalid piece positions
3. **Move Suggestions**: Show possible moves untuk selected piece
4. **Animation**: Animate piece detection dengan fade-in effect
5. **Offline Mode**: Local piece detection tanpa backend
6. **Custom Colors**: User dapat customize grid colors
7. **Square Highlighting**: Tap square untuk highlight
8. **AR Instructions**: Show arrows/guides untuk align board better
