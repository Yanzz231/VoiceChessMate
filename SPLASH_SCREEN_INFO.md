# Splash Screen Configuration

## Current Setup

### Image Details
- **File**: `assets/images/splash.png`
- **Source**: `download.png` (chess cat image)
- **Size**: 103KB
- **Dimensions**: 412x412 pixels
- **Format**: PNG (RGBA, 8-bit color)

### Configuration (app.json)
```json
"splash": {
  "image": "./assets/images/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#F4D03F"
}
```

### Settings Explained
- **resizeMode: "contain"** - Image will fit inside screen while maintaining aspect ratio
- **backgroundColor: "#F4D03F"** - Yellow background matching app theme
- **Native splash** - Handled by Expo automatically (no custom component needed)

## Files Kept vs Removed

### ✅ Kept (In Use)
- `splash.png` - Main splash screen image
- `icon.png` - App icon (22KB)
- `logo.png` - App logo for in-app use (673KB)
- `screen.jpg` - Screenshot for README (63KB)
- `favicon.png` - Web favicon (1.5KB)

### ❌ Removed (Unused)
- `react-logo.png` - Expo default template
- `react-logo@2x.png` - Expo default template
- `react-logo@3x.png` - Expo default template
- `partial-react-logo.png` - Expo default template
- `splash-icon.png` - Not used

## How to Test Splash Screen

### Method 1: Development Build
```bash
npm start
# Press 'a' for Android or 'i' for iOS
# Splash will show briefly on app launch
```

### Method 2: Production Build (Best for Testing)
For Android:
```bash
eas build --profile preview --platform android
# Install APK and launch - splash will be visible for 1-2 seconds
```

For iOS:
```bash
eas build --profile preview --platform ios
# Install on device - splash will show on launch
```

### Method 3: Expo Go (Quick Test)
```bash
npm start
# Scan QR code with Expo Go app
# Note: Splash may look different in Expo Go vs production
```

## Expected Behavior

1. **App Launch** → Yellow screen appears (#F4D03F)
2. **Splash Image** → Chess cat (download.png) displays centered
3. **Duration** → 1-2 seconds (auto-managed by Expo)
4. **Transition** → Fades to app content

## Troubleshooting

### Splash not showing?
1. Clear Expo cache: `expo start -c`
2. Rebuild app: `expo prebuild --clean`
3. Check image exists: `ls assets/images/splash.png`
4. Verify app.json has correct path

### Splash looks stretched/distorted?
- Change `resizeMode` to `"cover"` in app.json
- Ensure image is at least 1242x2436 for best quality on all devices

### Different splash for iOS/Android?
Add platform-specific config in app.json:
```json
"ios": {
  "splash": {
    "image": "./assets/images/splash-ios.png"
  }
},
"android": {
  "splash": {
    "image": "./assets/images/splash-android.png"
  }
}
```

## Notes

- **Native Implementation**: Expo handles splash screen natively - no custom React component needed
- **Performance**: Native splash = instant display (no JS loading delay)
- **Customization**: For advanced splash (animations), use `expo-splash-screen` library after app loads
- **Image Quality**: Use PNG with transparency for best results
- **Recommended Size**: 1242x2436 (iPhone 12 Pro Max) scales well to all devices

## Current Status

✅ Splash screen configured correctly
✅ Image file in place (download.png → splash.png)
✅ Background color matches theme
✅ Unused assets cleaned up
✅ Ready for testing

Last updated: 2024-10-23
