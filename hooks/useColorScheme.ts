import { useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);

  const toggleTheme = () => {
    setColorScheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { colorScheme, toggleTheme };
}
