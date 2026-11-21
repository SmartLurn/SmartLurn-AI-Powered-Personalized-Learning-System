import { useEffect } from "react";
import { GraduationCap } from "lucide-react";

const SPLASH_MS = 1200;

// Short intro shown when the site is opened/reloaded or right after logging in.
export default function WelcomeSplash({ onDone }) {
  useEffect(() => {
    if (!onDone) return; // the dashboard decides when to hide it
    const timer = setTimeout(onDone, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1f3d2b] via-[#183022] to-[#0a150f] px-6 text-center text-white"
      role="status"
    >
      {/* Soft expanding rings behind the logo */}
      <span className="absolute h-[520px] w-[520px] rounded-full bg-pop-500/20 blur-3xl" />
      <span className="absolute h-40 w-40 animate-ping rounded-full bg-white/10" style={{ animationDuration: "1.6s" }} />
      <span className="absolute h-64 w-64 rounded-full border border-white/10" />

      <div className="relative flex h-16 w-16 animate-pop-in items-center justify-center rounded-2xl bg-[#fffcf6] text-[#1f3d2b] shadow-xl shadow-black/30">
        <GraduationCap size={32} />
      </div>

      <h1 className="relative mt-8 animate-fade-up text-2xl font-semibold tracking-tight" style={{ animationDelay: "150ms" }}>
        SmartLurn
      </h1>
      <p className="relative mt-2 animate-fade-up text-sm text-[#dbe8de]" style={{ animationDelay: "250ms" }}>
        Getting your study space ready...
      </p>

      {/* Progress bar that fills while the splash is shown */}
      <div className="relative mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full origin-left animate-grow-x rounded-full bg-pop-400"
          style={{ animationDuration: `${SPLASH_MS}ms`, animationTimingFunction: "ease-out" }}
        />
      </div>
    </div>
  );
}
