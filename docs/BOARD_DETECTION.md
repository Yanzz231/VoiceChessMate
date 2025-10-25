# Chess Board Detection Feature

## Overview
Fitur deteksi papan catur real-time menggunakan OpenCV untuk mendeteksi posisi papan catur secara otomatis saat kamera diarahkan ke papan fisik.

## Cara Kerja

### 1. Real-time Detection
- Setiap 1 detik, kamera mengambil foto dengan kualitas rendah (quality: 0.3) untuk performa optimal
- Foto dikirim ke `ChessBoardDetectionService` untuk dianalisis menggunakan OpenCV
- Hasil deteksi ditampilkan sebagai overlay di layar kamera

### 2. Visual Feedback
- **Corners Detection**: Menampilkan 4 titik corner papan catur yang terdeteksi
- **Board Outline**: Menggambar polygon di sekitar papan yang terdeteksi
- **Grid Lines**: Menampilkan garis-garis grid 8x8 papan catur (jika terdeteksi)
- **Confidence Indicator**:
  - Hijau (confidence > 0.8): Papan terdeteksi dengan baik
  - Kuning (confidence 0.6-0.8): Papan terdeteksi kurang jelas
  - Merah (confidence < 0.6): Papan tidak terdeteksi dengan baik

### 3. Haptic Feedback
- Vibrasi 50ms saat papan terdeteksi dengan confidence > 0.8 (hanya jika voice mode aktif)

## Files yang Terlibat

### Services
- **`services/ChessBoardDetectionService.ts`**: Service utama untuk deteksi papan catur
  - `detectBoardWithOpenCV()`: Deteksi menggunakan OpenCV backend
  - `detectBoardInRealtime()`: Deteksi real-time dengan kualitas rendah
  - `isValidChessBoard()`: Validasi proporsi papan catur (aspect ratio ~1:1)
  - `calculateBoardBoundingBox()`: Hitung bounding box dari corners

### Components
- **`components/scan/BoardDetectionOverlay.tsx`**: Overlay visual untuk menampilkan hasil deteksi
  - Menggambar polygon di sekitar papan
  - Menampilkan 4 corner points
  - Menampilkan grid lines (opsional)
  - Label "Board Detected" dengan animasi pulse

### Pages
- **`app/scan.tsx`**: Camera screen dengan integrasi detection
  - State management untuk detection results
  - Real-time detection loop dengan interval 1 detik
  - Cleanup interval saat component unmount

## Backend API

### Endpoint: `/opencv-detect`
**Method**: POST
**Body**:
```json
{
  "image": "base64_encoded_image",
  "detectGrid": true,
  "detectCorners": true
}
```

**Response**:
```json
{
  "board_detected": true,
  "confidence": 0.85,
  "corners": {
    "tl": { "x": 100, "y": 100 },
    "tr": { "x": 500, "y": 100 },
    "bl": { "x": 100, "y": 500 },
    "br": { "x": 500, "y": 500 }
  },
  "grid_lines": [
    { "x1": 150, "y1": 100, "x2": 150, "y2": 500 },
    ...
  ]
}
```

## Performance Considerations

1. **Low Quality Images**: Menggunakan quality 0.3 untuk mengurangi beban processing
2. **Skip Processing**: Jika ada error, frame di-skip tanpa menghentikan detection loop
3. **Interval 1 detik**: Balance antara responsiveness dan battery/CPU usage
4. **Conditional Rendering**: Overlay hanya render jika `boardDetected === true`

## Troubleshooting

### Board tidak terdeteksi
1. Pastikan lighting cukup baik
2. Pastikan seluruh papan terlihat di kamera
3. Hindari refleksi atau bayangan yang menutupi papan
4. Pastikan papan memiliki kontras yang jelas (kotak putih vs hitam)

### Detection terlalu lambat
- Interval bisa disesuaikan di `startRealtimeDetection()` (default: 1000ms)
- Quality foto bisa dikurangi lebih lanjut (default: 0.3)

### Overlay tidak akurat
- Backend mungkin mengembalikan koordinat yang salah
- Cek scaling factor (`scaleX`, `scaleY`) di BoardDetectionOverlay
- Pastikan resolution kamera sesuai dengan expected resolution backend

## Future Improvements

1. **Adaptive Quality**: Adjust quality berdasarkan device performance
2. **Manual Correction**: Allow user untuk adjust corner points secara manual
3. **Piece Recognition**: Extend deteksi untuk recognize individual pieces
4. **Offline Mode**: Local OpenCV processing tanpa backend API
5. **Auto Capture**: Otomatis capture jika confidence > threshold tertentu
