# Real-time Chess Board Detection

## Overview
Sistem deteksi papan catur **otomatis dan continuous** yang langsung menampilkan grid kotak-kotak secara real-time dengan corner smoothing untuk stabilitas visual.

## Key Features

### 1. **Automatic Detection** - Tidak Ada Lock/Unlock
- ✅ **Deteksi otomatis** setiap 500ms
- ✅ **Update terus-menerus** tanpa perlu lock
- ✅ **Smooth transitions** dengan corner averaging
- ✅ **Tidak ada blinking** karena smoothing algorithm

### 2. **Corner Smoothing Algorithm**
Menggunakan **moving average** dari 3 frame terakhir untuk menghilangkan jittering:

```typescript
const smoothCorners = (newCorners) => {
  // Store last 3 corner detections
  cornerHistoryRef.current.push(newCorners);

  if (cornerHistoryRef.current.length > 3) {
    cornerHistoryRef.current.shift();
  }

  // Calculate average of all stored corners
  const avgCorners = calculateAverage(cornerHistoryRef.current);

  return avgCorners;
};
```

**Benefits:**
- ✅ Border tidak "jumping" meskipun coordinates berubah sedikit
- ✅ Smooth visual experience
- ✅ Tetap responsive (tidak lag)

### 3. **Fast Detection Interval**
```typescript
setInterval(async () => {
  // Take photo and detect
  const photo = await camera.takePictureAsync({
    quality: 0.3,  // Low quality for speed
    skipProcessing: true,
  });

  const result = await detectBoardWithOpenCV(photo.uri);

  // Update immediately with smoothed corners
  setBoardCorners(smoothCorners(result.corners));
  setSquareDetections(result.squareDetections);
}, 500);  // Every 500ms = 2 FPS detection rate
```

**Performance:**
- 500ms interval = 2 detections per second
- Low quality image (0.3) = fast upload
- Smooth corners = stable visual

### 4. **Confidence Threshold**
```typescript
if (result.boardDetected && result.confidence > 0.7) {
  // Show border and grid
} else {
  // Hide and reset
  cornerHistoryRef.current = [];
  setBoardDetected(false);
}
```

**Threshold: 0.7** (lowered from 0.8)
- More responsive detection
- Faster initial lock
- Still accurate enough

## How It Works

### Detection Flow

```
┌─────────────────────────────────────────────┐
│ Camera Ready                                │
└──────────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Start Detection Loop │ Every 500ms
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Take Low-Res Photo   │ quality: 0.3
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Send to OpenCV Backend   │
    └──────────┬───────────────┘
               │
               ▼
    ┌────────────────────────────┐
    │ Is confidence > 0.7?       │
    └──┬─────────────────────┬───┘
       │ Yes                 │ No
       ▼                     ▼
┌──────────────────┐   ┌─────────────────┐
│ Add to History   │   │ Clear History   │
│ (max 3 frames)   │   │ Hide Border     │
└──────┬───────────┘   └─────────────────┘
       │
       ▼
┌──────────────────┐
│ Calculate Avg    │ Smooth corners
│ from History     │ from last 3 frames
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Update UI:           │
│ - boardCorners       │ ← Smoothed!
│ - squareDetections   │
│ - boardDetected      │
└──────┬───────────────┘
       │
       └──────────────────────────┐
                                  ▼
                    ┌──────────────────────────┐
                    │ Border Stays Smooth      │
                    │ Grid Updates Smoothly    │
                    │ No Jumping/Blinking      │
                    └──────────────────────────┘
```

## Smoothing Algorithm Deep Dive

### Moving Average Formula

```typescript
// Store last N frames (N = 3)
cornerHistory = [frame1, frame2, frame3]

// For each corner point:
avgX = (frame1.x + frame2.x + frame3.x) / 3
avgY = (frame1.y + frame2.y + frame3.y) / 3

// Result: Smooth position
smoothCorner = { x: avgX, y: avgY }
```

### Visual Impact

**Without Smoothing:**
```
Frame 1: topLeft = {x: 100, y: 150}  → Border at (100, 150)
Frame 2: topLeft = {x: 103, y: 148}  → Border jumps to (103, 148) ❌
Frame 3: topLeft = {x: 98,  y: 152}  → Border jumps to (98, 152)  ❌
Frame 4: topLeft = {x: 101, y: 149}  → Border jumps to (101, 149) ❌
```
**Result**: Border "shaking" or "jumping" rapidly

**With Smoothing (3-frame average):**
```
Frame 1: topLeft = {x: 100, y: 150}  → Border at (100, 150)
Frame 2: topLeft = {x: 103, y: 148}  → Border at (101.5, 149)   ← Averaged!
Frame 3: topLeft = {x: 98,  y: 152}  → Border at (100.3, 150)   ← Smooth!
Frame 4: topLeft = {x: 101, y: 149}  → Border at (100.7, 149.7) ← Stable!
```
**Result**: Border moves smoothly, appears stable

### Trade-offs

**Pros:**
- ✅ Very smooth visual appearance
- ✅ No jittering or jumping
- ✅ Professional AR-like experience
- ✅ Minimal lag (only 3 frames = ~1.5s at most)

**Cons:**
- ⚠️ Slight delay in initial detection (needs 2-3 frames to stabilize)
- ⚠️ If board moves quickly, border lags slightly behind
- ⚠️ Uses slightly more memory (stores 3 corner sets)

## State Management

### State Variables

```typescript
// UI State
const [boardDetected, setBoardDetected] = useState(false);
const [boardCorners, setBoardCorners] = useState(undefined);
const [squareDetections, setSquareDetections] = useState([]);

// Detection State (refs - no re-render)
const cornerHistoryRef = useRef([]);     // Last 3 corner detections
const detectionCountRef = useRef(0);     // Total detections count
```

### Why Refs for History?

```typescript
// ❌ BAD: Using state
const [cornerHistory, setCornerHistory] = useState([]);
setCornerHistory([...history, newCorners]);  // Triggers re-render!

// ✅ GOOD: Using ref
cornerHistoryRef.current.push(newCorners);   // No re-render!
```

**Benefits:**
- No unnecessary re-renders
- Faster updates
- Better performance

## Performance Metrics

### Detection Rate
- **Interval**: 500ms
- **FPS**: 2 detections per second
- **Smoothing window**: 3 frames = 1.5 seconds
- **Latency**: ~750ms to stable border (3 frames × 500ms ÷ 2)

### Network Usage
- **Image quality**: 0.3 (low)
- **Average size**: ~50-100KB per frame
- **Upload rate**: 100-200KB per second
- **Total**: ~6-12MB per minute of scanning

### CPU/Memory
- **Camera capture**: Low impact (skipProcessing: true)
- **State updates**: 2 per second (corners + pieces)
- **Smoothing calculation**: Negligible (simple averaging)
- **Memory**: ~3 corner objects stored (minimal)

## Comparison

### Before (Locked Detection)
```
Timeline:
0.0s: Looking for board...
1.0s: Board detected! LOCKED ✅
1.5s: User moves board → Border stays locked at old position ❌
2.0s: Board moved → Still locked at old position ❌
3.0s: User presses reset → Start over
```

**Problems:**
- ❌ Manual reset required if board moves
- ❌ Not truly "real-time"
- ❌ Extra UI button needed

### After (Real-time Detection)
```
Timeline:
0.0s: Looking for board...
0.5s: Board detected → Border appears (slightly unstable)
1.0s: Border stabilizing with smoothing
1.5s: Border fully stable ✅
2.0s: User moves board → Border follows smoothly ✅
2.5s: Board at new position → Border updates automatically ✅
```

**Benefits:**
- ✅ Fully automatic
- ✅ True real-time tracking
- ✅ No manual intervention needed
- ✅ Smooth visual experience

## User Experience

### Initial Detection
1. User points camera at board
2. Within **1-2 seconds**, green border appears
3. Border may adjust slightly as it stabilizes
4. After **1.5 seconds**, border is fully stable
5. Grid and pieces appear automatically

### Continuous Tracking
1. User can move camera slightly
2. Border adjusts smoothly to follow board
3. No need to reset or re-detect
4. Pieces update in real-time

### Loss of Detection
1. If board moves out of frame or lighting changes
2. Border disappears gradually (not abrupt)
3. System automatically starts searching again
4. Re-detects when board is back in frame

## Configuration

### Tunable Parameters

```typescript
// Detection interval (ms)
const DETECTION_INTERVAL = 500;  // Default: 500ms (2 FPS)
// Lower = faster updates, higher CPU
// Higher = slower updates, lower CPU

// Smoothing window size
const SMOOTHING_WINDOW = 3;  // Default: 3 frames
// Lower = more responsive, more jittery
// Higher = smoother, more lag

// Confidence threshold
const CONFIDENCE_THRESHOLD = 0.7;  // Default: 0.7
// Lower = easier to detect, less accurate
// Higher = harder to detect, more accurate

// Image quality
const IMAGE_QUALITY = 0.3;  // Default: 0.3 (30%)
// Lower = faster upload, lower accuracy
// Higher = slower upload, better accuracy
```

### Recommended Settings

**For Fast Detection (Responsive):**
```typescript
DETECTION_INTERVAL = 300;
SMOOTHING_WINDOW = 2;
CONFIDENCE_THRESHOLD = 0.6;
IMAGE_QUALITY = 0.2;
```

**For Smooth Visuals (Stable):**
```typescript
DETECTION_INTERVAL = 700;
SMOOTHING_WINDOW = 5;
CONFIDENCE_THRESHOLD = 0.8;
IMAGE_QUALITY = 0.4;
```

**For Balanced (Current):**
```typescript
DETECTION_INTERVAL = 500;
SMOOTHING_WINDOW = 3;
CONFIDENCE_THRESHOLD = 0.7;
IMAGE_QUALITY = 0.3;
```

## Testing Guide

### Test 1: Initial Detection Speed
1. Open scanner
2. Point at board
3. ⏱️ **Expected**: Border appears within 1-2 seconds
4. ✅ **Expected**: Border stabilizes within 1.5 seconds total

### Test 2: Visual Stability
1. Keep camera pointed at board
2. Observe border for 10 seconds
3. ✅ **Expected**: Border stays perfectly still (no jumping)
4. ✅ **Expected**: Grid squares stay aligned

### Test 3: Tracking Movement
1. With board detected
2. Slowly pan camera left/right
3. ✅ **Expected**: Border follows smoothly (not jumpy)
4. ✅ **Expected**: No flickering or disappearing

### Test 4: Re-detection After Loss
1. Move board out of frame
2. ✅ **Expected**: Border disappears
3. Move board back into frame
4. ✅ **Expected**: Border reappears within 1-2 seconds

### Test 5: Piece Updates
1. With board detected and stable
2. Move a physical piece
3. ⏱️ **Expected**: Piece detection updates within 0.5-1 second
4. ✅ **Expected**: Border stays stable (doesn't blink)

## Files Modified

1. **app/scan.tsx**
   - Removed `boardLocked` state
   - Added `cornerHistoryRef` and `detectionCountRef`
   - Implemented `smoothCorners()` function
   - Modified `startRealtimeDetection()` with smoothing
   - Changed interval from 1000ms → 500ms
   - Lowered confidence threshold from 0.8 → 0.7
   - Removed reset button (not needed anymore)

## Known Limitations

1. **Initial Instability**: Border may adjust for first 1-2 seconds
2. **Fast Movement**: If camera moves very fast, border lags slightly
3. **Network Dependent**: Requires continuous API access
4. **Battery Usage**: More frequent detection = more battery drain

## Future Enhancements

1. **Adaptive Interval**: Slow down detection when board is stable
2. **Kalman Filter**: More sophisticated smoothing algorithm
3. **Motion Detection**: Detect camera movement and adjust smoothing
4. **Offline Mode**: Local detection without backend
5. **Frame Prediction**: Predict next position for smoother tracking
