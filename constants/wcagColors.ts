// WCAG 2.1 AA compliant color palette - Child-friendly & Accessible
// All color combinations meet minimum 4.5:1 contrast ratio for normal text
// Yellow & Blue palette for warm, friendly, and trustworthy feel

export const WCAGColors = {
  // Primary yellow palette - warm and cheerful
  primary: {
    yellow: '#F5A623', // Warm orange-yellow - main accent
    yellowLight: '#FFC857', // Bright yellow - highlights
    yellowDark: '#E68A00', // Deep orange - pressed states
    yellowBg: '#FFF8E7', // Very light yellow - backgrounds
  },

  // Secondary blue palette - trust and calm
  secondary: {
    blue: '#4A90E2', // Soft blue - complementary color
    blueLight: '#7FB3F0', // Light blue - hover states
    blueDark: '#2E5C8A', // Dark blue - text on light bg
    blueBg: '#E8F4FD', // Very light blue - backgrounds
  },

  // Neutral palette - optimized for readability
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray600: '#757575', // WCAG AA compliant on white (4.6:1)
    gray700: '#616161', // High contrast (7:1)
    gray800: '#424242', // Higher contrast (11:1)
    gray900: '#212121', // Maximum contrast (16:1)
  },

  // Semantic colors - WCAG compliant
  semantic: {
    success: '#059669', // Green 600 - success states
    successBg: '#D1FAE5', // Green 100 - success backgrounds
    error: '#DC2626', // Red 600 - error states
    errorBg: '#FEE2E2', // Red 100 - error backgrounds
    info: '#2563EB', // Blue 600 - info states
    infoBg: '#DBEAFE', // Blue 100 - info backgrounds
    warning: '#D97706', // Amber 600 - warning states
    warningBg: '#FEF3C7', // Amber 100 - warning backgrounds
  },

  // Focus and interaction states - high visibility
  interaction: {
    focus: '#F59E0B', // Yellow focus ring
    focusRing: 'rgba(245, 158, 11, 0.5)', // Semi-transparent yellow
    pressed: '#B45309', // Amber 700 - pressed state
    disabled: '#D1D5DB', // Gray 300 - disabled state
    disabledText: '#9CA3AF', // Gray 400 - disabled text
  },

  // Gradients for visual interest while maintaining readability
  gradients: {
    primary: ['#FFC857', '#F5A623'], // Warm yellow gradient
    secondary: ['#4A90E2', '#2E5C8A'], // Blue gradient
    warm: ['#FFC857', '#E68A00'], // Warm sunset gradient
    cool: ['#7FB3F0', '#4A90E2'], // Cool sky gradient
    subtle: ['#FFF8E7', '#FFE4B5'], // Very subtle yellow
  },
};

// Utility function to get text color based on background for WCAG compliance
export const getTextColor = (background: 'light' | 'dark' | 'yellow'): string => {
  switch (background) {
    case 'light':
      return WCAGColors.neutral.gray900;
    case 'dark':
      return WCAGColors.neutral.white;
    case 'yellow':
      return WCAGColors.neutral.gray900; // Dark text on yellow for contrast
    default:
      return WCAGColors.neutral.gray900;
  }
};

// Accessibility sizes - WCAG 2.1 Level AA - Optimized for children
export const AccessibilitySizes = {
  // Minimum touch target size: 48x48 points (better for children)
  minTouchTarget: 48,
  minTouchTargetLarge: 56, // For primary actions

  // Text sizes - reduced from original, more appropriate scaling
  text: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    xxxl: 26,
    display: 32,
    hero: 28,
  },

  // Spacing for better readability - slightly tighter
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    xxl: 36,
  },

  // Border radius - more rounded for friendly feel
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  // Font weights for better hierarchy
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};
