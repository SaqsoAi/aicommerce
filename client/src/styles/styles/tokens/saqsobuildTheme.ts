export const saqsoBuildTheme = {
  light: {
    background: '#f8fafc', surface: '#ffffff', surfaceElevated: '#f1f5f9', text: '#0f172a', muted: '#64748b', border: 'rgba(15, 23, 42, 0.12)', primary: '#7c3aed', accent: '#f59e0b', success: '#10b981', danger: '#ef4444'
  },
  dark: {
    background: '#070b16', surface: '#0d1424', surfaceElevated: '#111b2f', text: '#f8fafc', muted: '#94a3b8', border: 'rgba(148, 163, 184, 0.18)', primary: '#a78bfa', accent: '#fbbf24', success: '#34d399', danger: '#fb7185'
  },
  radius: { sm: '10px', md: '16px', lg: '22px', xl: '30px', pill: '999px' },
  shadow: { soft: '0 18px 50px rgba(15, 23, 42, 0.12)', premium: '0 28px 90px rgba(2, 6, 23, 0.28)' },
  motion: { fast: '140ms ease', normal: '220ms ease', slow: '360ms ease' }
} as const;

export type SaqsoBuildThemeMode = keyof Pick<typeof saqsoBuildTheme, 'light' | 'dark'>;