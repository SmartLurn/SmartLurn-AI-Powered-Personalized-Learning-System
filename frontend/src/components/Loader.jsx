import { GraduationCap } from "lucide-react";

// Branded loading animation: the logo with a spinning ring around it.
// fullScreen = true fills the whole page (for page-level loading).
const Loader = ({ text = "Loading...", fullScreen = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-dvh bg-canvas" : "py-10"
      }`}
      role="status"
    >
      <div className={`relative flex items-center justify-center ${fullScreen ? "h-16 w-16" : "h-11 w-11"}`}>
        {/* Spinning ring */}
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-brand-100 border-t-pop-500" />
        {/* Logo in the middle, gently pulsing */}
        <span
          className={`flex animate-pulse items-center justify-center rounded-lg bg-cta text-on-cta ${
            fullScreen ? "h-9 w-9" : "h-6 w-6 rounded-md"
          }`}
        >
          <GraduationCap size={fullScreen ? 19 : 13} />
        </span>
      </div>

      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
      {!text && <span className="sr-only">Loading</span>}
    </div>
  );
};

export default Loader;
