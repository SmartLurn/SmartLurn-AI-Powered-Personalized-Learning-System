// Round avatar with the user's initials
export default function Avatar({ name, size = 36, className = "" }) {
  const initials =
    (name || "S")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "S";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
