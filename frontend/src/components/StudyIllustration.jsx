// Decorative illustration (books, plant, sun) in the SmartLurn colours.
// Used in the dashboard banner and on the login page.
export default function StudyIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft background shape */}
      <circle cx="175" cy="125" r="100" fill="#fdebd8" />
      <circle cx="255" cy="70" r="24" fill="#f2954b" />

      {/* Sparkles */}
      <path d="M92 48 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z" fill="#f9b177" />
      <path d="M285 140 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="#9fc58b" />

      {/* Plant */}
      <ellipse cx="50" cy="142" rx="12" ry="30" fill="#5e8f4a" transform="rotate(-28 50 142)" />
      <ellipse cx="78" cy="138" rx="12" ry="32" fill="#7aaa64" transform="rotate(24 78 138)" />
      <ellipse cx="64" cy="128" rx="10" ry="34" fill="#4a753a" />
      <path d="M42 168 h44 l-6 46 a6 6 0 0 1 -6 5 h-20 a6 6 0 0 1 -6 -5z" fill="#e97f2e" />

      {/* Stack of books */}
      <rect x="110" y="196" width="140" height="20" rx="4" fill="#5e8f4a" />
      <rect x="120" y="176" width="120" height="20" rx="4" fill="#f2954b" />
      <rect x="114" y="156" width="128" height="20" rx="4" fill="#c4ddb6" />
      <rect x="126" y="202" width="40" height="4" rx="2" fill="#c4ddb6" />
      <rect x="132" y="182" width="36" height="4" rx="2" fill="#fff5ec" />

      {/* Open book on top */}
      <path d="M178 150 C158 136 134 134 112 140 L112 84 C134 78 158 80 178 94 Z" fill="#ffffff" />
      <path d="M178 150 C198 136 222 134 244 140 L244 84 C222 78 198 80 178 94 Z" fill="#fff5ec" />
      <path d="M178 94 V150" stroke="#e97f2e" strokeWidth="3" />
      <g stroke="#fdd0a8" strokeWidth="3" strokeLinecap="round">
        <path d="M126 98 C140 94 152 95 164 100" />
        <path d="M126 110 C140 106 152 107 164 112" />
        <path d="M126 122 C140 118 152 119 164 124" />
        <path d="M192 100 C204 95 216 94 230 98" />
        <path d="M192 112 C204 107 216 106 230 110" />
      </g>
    </svg>
  );
}
