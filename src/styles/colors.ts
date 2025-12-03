// Business Management App - Clean, Professional, User-Friendly

// Light Theme Colors
export const lightTheme = {
  // Primary Colors - Sophisticated Shiny Blue (Trust, Reliability, Premium)
  primary: '#1e3a8a',        // Deep Navy Blue with grey undertones - Main actions
  primaryDark: '#0f172a',    // Dark Slate - Hover states
  primaryLight: '#3b82f6',   // Bright Blue accent - Backgrounds

  // Secondary Colors - Clean Accent
  secondary: '#10B981',      // Fresh Green - Success, Available
  secondaryDark: '#059669',  // Dark Green
  secondaryLight: '#34D399', // Light Green

  // Accent Colors
  accent: '#8B5CF6',         // Purple - Special features
  accentOrange: '#F59E0B',   // Orange - Warnings, attention

  // Status Colors (Clear & Distinct)
  success: '#10B981',        // Green - Available, Success
  warning: '#F59E0B',        // Amber - Low stock, warnings
  error: '#EF4444',          // Red - Errors, sold out
  info: '#3B82F6',           // Blue - Information

  // Neutrals - Clean & Modern
  background: '#F8FAFC',     // Very light gray background
  backgroundDark: '#F1F5F9', // Slightly darker for contrast
  white: '#FFFFFF',
  black: '#000000',

  // Text Colors - High Contrast for Readability
  textPrimary: '#0F172A',    // Almost black - Main text
  textSecondary: '#64748B',  // Medium gray - Secondary text
  textLight: '#FFFFFF',      // White - On dark backgrounds
  textMuted: '#94A3B8',      // Light gray - Disabled/muted

  // Borders & Dividers - Subtle
  border: '#E2E8F0',         // Light border
  divider: '#CBD5E1',        // Divider lines

  // Card & Surface - Clean whites
  surface: '#FFFFFF',
  surfaceLight: '#FAFBFC',   // Very subtle gray

  // Inventory Status (for tickets)
  available: '#10B981',      // Green - Available tickets
  sold: '#94A3B8',           // Gray - Sold tickets
  lowStock: '#F59E0B',       // Orange - Low inventory
};

// Dark Theme Colors - Lighter, more comfortable palette
export const darkTheme = {
  // Primary Colors - Soft, lighter blues for comfortable viewing
  primary: '#60A5FA',        // Soft bright blue - Main actions (lighter than before)
  primaryDark: '#3B82F6',    // Medium bright blue
  primaryLight: '#93C5FD',   // Very light blue accent

  // Secondary Colors - Softer greens
  secondary: '#34D399',      // Soft emerald green - Success, Available
  secondaryDark: '#10B981',  // Medium green
  secondaryLight: '#6EE7B7', // Light mint green

  // Accent Colors - Lighter, softer tones
  accent: '#A78BFA',         // Soft lavender purple
  accentOrange: '#FBBF24',   // Warm golden amber

  // Status Colors - Lighter, easier on the eyes
  success: '#6EE7B7',        // Soft mint green
  warning: '#FCD34D',        // Soft yellow-amber
  error: '#F87171',          // Soft coral red
  info: '#7DD3FC',           // Soft sky blue

  // Neutrals - Softer dark backgrounds
  background: '#1F2937',     // Soft dark blue-gray (warmer than pure black)
  backgroundDark: '#111827', // Darker blue-gray for depth
  white: '#FFFFFF',          // Keep white
  black: '#000000',          // Keep black

  // Text Colors - Softer whites and grays
  textPrimary: '#F9FAFB',    // Soft white - Main text (easier on eyes)
  textSecondary: '#D1D5DB',  // Light warm gray - Secondary text
  textLight: '#F9FAFB',      // Soft white - Emphasized text
  textMuted: '#9CA3AF',      // Medium warm gray - Disabled/muted

  // Borders & Dividers - Softer, visible but subtle
  border: '#4B5563',         // Medium gray border (lighter)
  divider: '#374151',        // Subtle divider

  // Card & Surface - Lighter elevated surfaces
  surface: '#374151',        // Elevated surface (lighter)
  surfaceLight: '#4B5563',   // Even lighter elevated surface

  // Inventory Status (for tickets) - Softer, lighter variants
  available: '#6EE7B7',      // Soft mint green - Available tickets
  sold: '#9CA3AF',           // Medium gray - Sold tickets
  lowStock: '#FCD34D',       // Soft amber - Low inventory
};

// Backward compatibility - export Colors as lightTheme
export const Colors = lightTheme;
