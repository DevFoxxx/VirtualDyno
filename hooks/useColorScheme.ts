import { useAppTheme } from '@/context/AppThemeContext';

export function useColorScheme() {
  const { colorScheme } = useAppTheme();
  return colorScheme;
}
