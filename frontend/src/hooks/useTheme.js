import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

// { theme: "light" | "dark" | "system", isDark, setTheme, toggleTheme }
const useTheme = () => useContext(ThemeContext);

export default useTheme;
