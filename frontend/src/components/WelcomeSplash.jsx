import { useEffect } from "react";
import { GraduationCap } from "lucide-react";

const SPLASH_MS = 1200;

// Short welcome screen shown right after logging in or signing up,
// then onDone() moves on to the dashboard.
export default function WelcomeSplash({ name, isNewUser = false, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  const firstName = name?.trim()?.split(" ")[0];

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-6 text-center text-white"
      role="status"
    >
      {/* Soft expanding rings behind the logo */}
      <span className="absolute h-40 w-40 animate-ping rounded-full bg-white/10" style={{ animationDuration: "1.6s" }} />
      <span className="absolute h-64 w-64 rounded-full border border-white/10" />

      <div className="relative flex h-16 w-16 animate-pop-in items-center justify-center rounded-2xl bg-white text-brand-600 shadow-xl shadow-brand-950/30">
        <GraduationCap size={32} />
      </div>

      <h1 className="relative mt-8 animate-fade-up text-2xl font-semibold tracking-tight" style={{ animationDelay: "150ms" }}>
        {isNewUser ? "Welcome to SmartLurn" : "Welcome back"}
        {firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="relative mt-2 animate-fade-up text-sm text-brand-100" style={{ animationDelay: "250ms" }}>
        Getting your study space ready...
      </p>

      {/* Progress bar that fills while the splash is shown */}
      <div className="relative mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full origin-left animate-grow-x rounded-full bg-teal-300"
          style={{ animationDuration: `${SPLASH_MS}ms`, animationTimingFunction: "ease-out" }}
        />
      </div>
    </div>
  );
}
