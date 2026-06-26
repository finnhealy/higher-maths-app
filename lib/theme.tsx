import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

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

type AppTheme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
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
