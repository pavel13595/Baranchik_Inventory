import { useTheme } from "../../contexts/theme-context";

export function useThemeToggleLogic() {
  const { theme, toggleTheme } = useTheme();
  return { theme, toggleTheme };
}
