import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeContextValue = {
  colorScheme: NonNullable<ColorSchemeName>;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [colorScheme, setColorScheme] = useState<NonNullable<ColorSchemeName>>(
    systemColorScheme ?? 'light'
  );
  const [hasManualPreference, setHasManualPreference] = useState(false);

  useEffect(() => {
    if (!hasManualPreference) {
      setColorScheme(systemColorScheme ?? 'light');
    }
  }, [systemColorScheme, hasManualPreference]);

  const toggleTheme = () => {
    setHasManualPreference(true);
    setColorScheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(() => ({ colorScheme, toggleTheme }), [colorScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
