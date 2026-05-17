export const colors = {
  primary:      '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark:  '#5B21B6',
  accent:       '#F97316',
  accentLight:  '#FED7AA',
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  bg:           '#0A0A0A',
  bgCard:       '#141414',
  bgCardHover:  '#1C1C1C',
  border:       '#2A2A2A',
  text:         '#F5F5F5',
  textMuted:    '#888888',
  white:        '#FFFFFF',
}

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32,
}

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 9999,
}

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.text },
  small: { fontSize: 12, fontWeight: '400' as const, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '600' as const, color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
}
