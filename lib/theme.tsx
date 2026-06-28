import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TextStyle, useColorScheme, ViewStyle } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeColors = {
  background: string;
  card: string;
  cardAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  tabBar: string;
};

type ThemeSpacing = typeof spacing;
type ThemeRadii = typeof radii;
type ThemeTypography = typeof typography;
type ThemeShadows = typeof shadows;

type AppTheme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  setMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
};

const lightColors: ThemeColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardAlt: '#F1F5F9',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  tabBar: '#FFFFFF',
};

const darkColors: ThemeColors = {
  background: '#07111F',
  card: '#111827',
  cardAlt: '#172033',
  text: '#F8FAFC',
  muted: '#AAB6C7',
  border: '#263449',
  primary: '#60A5FA',
  tabBar: '#0B1220',
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
} satisfies Record<string, TextStyle>;

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
} satisfies Record<string, ViewStyle>;

const ThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      spacing,
      radii,
      typography,
      shadows,
      setMode,
      toggleDarkMode: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [isDark, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }
  return theme;
}
