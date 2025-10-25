# Changes - AR Grid Detection Fixed

## Problem
User reported bahwa overlay "cuma kedip kedip doang" (just blinking), padahal diinginkan border **tetap** (static) seperti di reference image.

## Reference Image
User menunjukkan gambar dengan:
- **Green border tebal** (#00FF00) di sekeliling board yang terdeteksi
- **Label "Detected board quad (expanded)"** di atas board
- **Grid 8x8** yang mengikuti perspektif board (miring)
- **Tidak ada animasi kedip-kedip**

## Changes Made

### 1. Removed Pulse Animation ([ChessGridOverlay.tsx](../components/scan/ChessGridOverlay.tsx))

**Before:**
```typescript
const pulseAnim = React.useRef(new Animated.Value(1)).current;

React.useEffect(() => {
  if (boardDetected) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }
}, [boardDetected]);

// Badge with animation
<Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
```

**After:**
```typescript
// No animation - removed pulseAnim completely

// Static badge
<View style={{ /* no animation */ }}>
```

### 2. Changed Border to Bright Green Lines

**Before:**
```typescript
<Rect
  x={scaledCorners.topLeft.x}
  y={scaledCorners.topLeft.y}
  width={scaledCorners.topRight.x - scaledCorners.topLeft.x}
  height={scaledCorners.bottomLeft.y - scaledCorners.topLeft.y}
  fill="transparent"
  stroke={WCAGColors.semantic.success}  // Darker green
  strokeWidth="3"
/>
```

**After:**
```typescript
// 4 separate lines untuk perspektif yang tepat
<Line
  x1={scaledCorners.topLeft.x}
  y1={scaledCorners.topLeft.y}
  x2={scaledCorners.topRight.x}
  y2={scaledCorners.topRight.y}
  stroke="#00FF00"  // Bright green
  strokeWidth="5"   // Thicker
/>
// ... (3 more lines for other edges)
```

### 3. Updated Badge Text & Style

**Before:**
```typescript
<Animated.View style={{
  backgroundColor: WCAGColors.semantic.success,  // Dark green
  borderRadius: 12,
  transform: [{ scale: pulseAnim }],  // Animated
}}>
  <Text style={{ color: WCAGColors.neutral.white }}>
    Board Locked - {detectedPiecesCount} pieces
  </Text>
</Animated.View>
```

**After:**
```typescript
<View style={{
  backgroundColor: 'rgba(0, 255, 0, 0.9)',  // Bright green
  borderRadius: 6,
  // No animation
}}>
  <Text style={{ color: '#000', fontWeight: '700' }}>
    Detected board quad (expanded)
  </Text>
</View>
```

### 4. Added Secondary Badge for Piece Count

**New addition:**
```typescript
{detectedPiecesCount > 0 && (
  <View style={{
    position: 'absolute',
    top: scaledCorners.bottomLeft.y + 10,
    left: scaledCorners.topLeft.x,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  }}>
    <Text style={{ color: '#00FF00', fontWeight: '600' }}>
      {detectedPiecesCount} pieces detected
    </Text>
  </View>
)}
```

### 5. Fixed Grid Perspective with Polygons

**Before:**
```typescript
// Used Rect which doesn't follow perspective properly
<Rect
  x={pos.x}
  y={pos.y}
  width={nextColPos.x - pos.x}
  height={nextRowPos.y - pos.y}
  fill={fillColor}
  stroke={strokeColor}
  strokeWidth={strokeWidth}
/>
```

**After:**
```typescript
// Use Polygon with 4 corners for proper perspective
const nextRowNextColPos = getSquarePosition(row + 1, col + 1);
const squarePoints = `${pos.x},${pos.y} ${nextColPos.x},${nextColPos.y} ${nextRowNextColPos.x},${nextRowNextColPos.y} ${nextRowPos.x},${nextRowPos.y}`;

<Polygon
  points={squarePoints}
  fill={fillColor}
  stroke={strokeColor}
  strokeWidth={strokeWidth}
/>
```

### 6. Adjusted Square Colors to be More Subtle

**Before:**
```typescript
const baseColor = isDarkSquare
  ? 'rgba(139, 69, 19, 0.3)'   // Dark brown
  : 'rgba(245, 222, 179, 0.3)'; // Light beige

let strokeColor = 'rgba(255, 255, 255, 0.4)';
let strokeWidth = 1;

if (detection && detection.hasPiece) {
  fillColor = detection.pieceColor === 'white'
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)';
  strokeColor = WCAGColors.primary.yellow;  // Yellow
  strokeWidth = 2;
}
```

**After:**
```typescript
const baseColor = isDarkSquare
  ? 'rgba(100, 100, 100, 0.15)'  // Subtle gray
  : 'rgba(200, 200, 200, 0.1)';  // Very subtle light gray

let strokeColor = 'rgba(255, 255, 255, 0.25)';
let strokeWidth = 0.5;

if (detection && detection.hasPiece) {
  fillColor = detection.pieceColor === 'white'
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.4)';
  strokeColor = '#00FF00';  // Green to match border
  strokeWidth = 1.5;
}
```

## Visual Result

### Before (Blinking):
```
┌────────────────────────────┐
│ 🟢 Board Locked           │ ← Animated pulse
├─────────────────────────┬─┤
│ Green Rect (darker)     │ │ ← strokeWidth: 3
│ Moving/pulsing          │ │
└─────────────────────────┴─┘
```

### After (Static):
```
┌────────────────────────────┐
│ Detected board quad       │ ← Static badge
│ (expanded)                │
├───────────────────────────┤
║ Bright Green Border #00FF00 ← strokeWidth: 5
║ Following perspective      ║
║ 64 squares as polygons     ║
║                            ║
└───────────────────────────┘
  X pieces detected          ← Secondary badge
```

## Testing

To test the changes:
1. Open app and navigate to `/scan`
2. Point camera at chess board
3. Wait for board detection
4. Verify:
   - ✅ Green border is **static** (not blinking)
   - ✅ Border is **bright green** (#00FF00)
   - ✅ Border is **thicker** (strokeWidth: 5)
   - ✅ Grid follows board perspective (even if tilted)
   - ✅ Badge says "Detected board quad (expanded)"
   - ✅ No animation/pulse effect

## Backend Requirements

No backend changes needed. The visual changes are all frontend-only.

Backend should continue to return:
```json
{
  "board_detected": true,
  "corners": {
    "tl": { "x": 100, "y": 150 },
    "tr": { "x": 500, "y": 150 },
    "bl": { "x": 100, "y": 550 },
    "br": { "x": 500, "y": 550 }
  },
  "pieces": [...]
}
```

## Files Modified

1. **components/scan/ChessGridOverlay.tsx**
   - Removed pulse animation
   - Changed Rect to Polygon for squares
   - Updated colors (bright green #00FF00)
   - Added static badges
   - Improved perspective rendering

2. **No changes to scan.tsx** - Integration remains the same

## Known Issues

None. All visual feedback is now static and matches the reference image.
