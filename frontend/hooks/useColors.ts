import { useTheme } from "@/lib/theme-context";
import colors from "@/constants/colors";

export function useColors() {
  const { isDark } = useTheme();
  const palette = isDark ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
