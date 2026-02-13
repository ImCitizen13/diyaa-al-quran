export const colors = {
  gold: {
    primary: '#d4af37',
    bright: '#ffd700',
    dim: '#8a7225',
  },
  glow: {
    inner: 'rgba(212, 175, 55, 0.5)',
    mid: 'rgba(212, 175, 55, 0.3)',
    outer: 'rgba(212, 175, 55, 0.15)',
    card: 'rgba(212, 175, 55, 0.06)',
    cardBorder: 'rgba(212, 175, 55, 0.12)',
  },
  text: {
    arabicActive: '#ffffff',
    arabicDefault: 'rgba(255, 255, 255, 0.65)',
    label: 'rgba(255, 255, 255, 0.3)',
    muted: 'rgba(255, 255, 255, 0.45)',
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
  bg: {
    primary: '#0A0A0A',
    secondary: '#151515',
    card: '#1c1c1c',
    elevated: '#242424',
  },
  orb: {
    empty: '#2a2a2a',
    dimGlow: 'rgba(212, 175, 55, 0.25)',
    midGlow: 'rgba(212, 175, 55, 0.50)',
    strongGlow: 'rgba(212, 175, 55, 0.75)',
    fullGlow: '#ffd700',
    center: '#ffffff',
  },
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
  },
} as const;

export default {
  light: {
    text: colors.text.primary,
    background: colors.bg.primary,
    tint: colors.gold.primary,
    tabIconDefault: colors.text.muted,
    tabIconSelected: colors.gold.primary,
  },
};
