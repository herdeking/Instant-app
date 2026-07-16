import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@fulltime_theme_mode';

const darkColors = {
  bg: '#0A0E1A',
  bgCard: '#0F1729',
  bgCardAlt: '#131C2E',
  bgTab: '#070B15',
  gold: '#F59E0B',
  goldDark: '#B45309',
  goldLight: '#FCD34D',
  textPrimary: '#F9FAFB',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  live: '#EF4444',
  success: '#22C55E',
  border: '#1E2D4A',
};

const lightColors = {
  bg: '#F5F7FA',
  bgCard: '#FFFFFF',
  bgCardAlt: '#F0F2F5',
  bgTab: '#FFFFFF',
  gold: '#F59E0B',
  goldDark: '#B45309',
  goldLight: '#FCD34D',
  textPrimary: '#0F1729',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  live: '#DC2626',
  success: '#16A34A',
  border: '#E2E8F0',
};

// Default export kept for any code still using static COLORS (dark by default)
export const COLORS = darkColors;

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') setMode(stored);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  };

  const COLORS = mode === 'dark' ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, COLORS, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
