export const palette = {
  mint: '#6ee7b7',
  tealLight: '#2dd4bf',
  teal: '#14b8a6',
  tealDark: '#0f9488',

  background: '#0d1117',
  surface: '#151b23',
  surfaceElevated: '#1c2430',
  border: '#262e3a',
  borderStrong: '#39424f',

  textPrimary: '#f0f6fc',
  textSecondary: '#9aa7b6',
  textTertiary: '#6b7785',

  success: '#4ade80',
  error: '#f87171',
  warning: '#fbbf24',

  white: '#ffffff',
  black: '#000000',
} as const;

export const gradient = {
  brand: [palette.mint, palette.tealLight, palette.teal] as const,
};

export const categoryColors = {
  healthcare: '#38bdf8',
  food: '#fb923c',
  fun: '#f472b6',
  wellness: '#a78bfa',
  travel: '#facc15',
  telecom: '#94a3b8',
} as const;

export const Colors = {
  ...palette,
  gradient,
  category: categoryColors,
};

export type CategoryColorKey = keyof typeof categoryColors;
