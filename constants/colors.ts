import { useThemeStore } from '@/store/theme-store';

const lightColors = {
  primary: '#4A6FA5', // Main app color (blue)
  secondary: '#98C1D9', // Secondary color (lighter blue)
  background: '#F8F9FA', // Light background
  text: '#2D3748', // Dark text
  textLight: '#718096', // Light text
  white: '#FFFFFF',
  black: '#000000',
  
  // Eisenhower matrix quadrant colors
  urgent_important: '#E53E3E', // Do (red)
  not_urgent_important: '#38A169', // Schedule (green)
  urgent_not_important: '#4299E1', // Delegate (blue)
  not_urgent_not_important: '#718096', // Eliminate (gray)
  
  // UI elements
  success: '#48BB78',
  warning: '#F6AD55',
  error: '#F56565',
  border: '#E2E8F0',
  cardBackground: '#FFFFFF',
  inputBackground: '#EDF2F7',
};

const darkColors = {
  primary: '#6B8EB8', // Lighter blue for dark mode
  secondary: '#98C1D9', // Secondary color (lighter blue)
  background: '#1A202C', // Dark background
  text: '#F7FAFC', // Light text
  textLight: '#A0AEC0', // Medium light text
  white: '#FFFFFF',
  black: '#000000',
  
  // Eisenhower matrix quadrant colors
  urgent_important: '#FC8181', // Do (lighter red)
  not_urgent_important: '#68D391', // Schedule (lighter green)
  urgent_not_important: '#63B3ED', // Delegate (lighter blue)
  not_urgent_not_important: '#A0AEC0', // Eliminate (lighter gray)
  
  // UI elements
  success: '#68D391',
  warning: '#F6AD55',
  error: '#FC8181',
  border: '#2D3748',
  cardBackground: '#2D3748',
  inputBackground: '#4A5568',
};

export const useColors = () => {
  const { theme } = useThemeStore();
  return theme === 'dark' ? darkColors : lightColors;
};

// For backward compatibility
export const colors = lightColors;
export default colors;