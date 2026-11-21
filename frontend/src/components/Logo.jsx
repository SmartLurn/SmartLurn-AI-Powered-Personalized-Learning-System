import { GraduationCap } from "lucide-react";

// SmartLurn logo: icon + name. light = white text (for coloured backgrounds)
export default function Logo({ light = false, size = "md" }) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex ${box} shrink-0 items-center justify-center bg-pop-500 text-white ${
          light ? "ring-2 ring-white/30" : ""
        }`}
      >
        <GraduationCap size={size === "sm" ? 17 : 21} />
      </div>
      <span
        className={`font-semibold tracking-tight ${size === "sm" ? "text-base" : "text-lg"} ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        SmartLurn
      </span>
    </div>
  );
}
