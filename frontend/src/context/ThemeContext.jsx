import { createContext, useCallback, useEffect, useState } from "react";

// Light / dark / system theme, saved on this device.
// index.html applies the saved theme before the page paints, so there is no flash.
const STORAGE_KEY = "theme";

export const ThemeContext = createContext(null);

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const readSavedTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readSavedTheme); // "light" | "dark" | "system"
  const [systemIsDark, setSystemIsDark] = useState(prefersDark);

  const isDark = theme === "dark" || (theme === "system" && systemIsDark);

  // Put the .dark class on <html> so the dark colours apply
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Follow the device setting while "system" is chosen
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemIsDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // storage blocked (private mode): the choice still applies until reload
    }
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => setTheme(isDark ? "light" : "dark"), [isDark, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
