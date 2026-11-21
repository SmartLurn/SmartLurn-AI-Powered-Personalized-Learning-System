import { Moon, Sun } from "lucide-react";
import useTheme from "../hooks/useTheme";

// Sun/moon button that switches between light and dark
export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`press relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      {/* Icons slide and rotate when switching */}
      <Sun
        size={17}
        className={`absolute transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
      <Moon
        size={17}
        className={`absolute transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
      />
    </button>
  );
}
