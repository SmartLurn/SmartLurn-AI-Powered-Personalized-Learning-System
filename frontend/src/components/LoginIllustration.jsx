// Isometric study scene for the login page: calendar, laptop, floating tiles.
// Drawn in code (no image files) in the SmartLurn colours.
const ISO_FLOOR = "matrix(0.866 0.5 -0.866 0.5 0 0)"; // flat on the ground
const ISO_RIGHT_WALL = "matrix(0.866 0.5 0 1 0 0)"; // standing, facing right

function Tile({ x, y, size = 10, color }) {
  return (
    <g transform={`translate(${x} ${y}) ${ISO_FLOOR}`}>
      <rect width={size} height={size} rx="1.5" fill={color} />
    </g>
  );
}

export default function LoginIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 460 400" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* Soft floor */}
      <ellipse cx="235" cy="300" rx="190" ry="78" fill="#eef0fd" />

      {/* Floating tiles */}
      <g className="animate-float" style={{ animationDuration: "7s" }}>
        <Tile x={70} y={250} color="#c7cdfa" />
        <Tile x={100} y={300} size={8} color="#5d63e3" />
        <Tile x={360} y={330} color="#2dd4bf" />
        <Tile x={395} y={265} size={8} color="#c7cdfa" />
        <Tile x={150} y={345} size={7} color="#c7cdfa" />
        <Tile x={300} y={355} size={9} color="#5d63e3" />
        <Tile x={60} y={175} size={7} color="#2dd4bf" />
      </g>

      {/* Calendar standing at the back */}
      <g className="animate-float" style={{ animationDuration: "6s" }}>
        <g transform={`translate(285 18) ${ISO_RIGHT_WALL}`}>
          {/* Side thickness */}
          <rect x="6" y="6" width="150" height="176" rx="12" fill="#c7cdfa" />
          <rect width="150" height="176" rx="12" fill="#ffffff" stroke="#dfe3fb" strokeWidth="2" />
          <rect width="150" height="40" rx="12" fill="#5d63e3" />
          <rect y="24" width="150" height="16" fill="#5d63e3" />
          {/* Rings */}
          {[18, 40, 62, 84, 106, 128].map((x) => (
            <rect key={x} x={x} y="-8" width="5" height="18" rx="2.5" fill="#3d3cb8" />
          ))}
          {/* Day grid */}
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 5 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={16 + col * 25}
                y={56 + row * 23}
                width="16"
                height="14"
                rx="3"
                fill={row === 1 && col === 2 ? "#ffe4e6" : row === 3 && col === 3 ? "#ccfbf1" : "#eef0fd"}
              />
            ))
          )}
          {/* Exam day circled, revision day ticked */}
          <circle cx="74" cy="86" r="13" fill="none" stroke="#f43f5e" strokeWidth="3" />
          <path d="M96 131 l5 5 l9 -11" fill="none" stroke="#14b8a6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Notification badge */}
        <g transform="translate(428 22)">
          <circle r="15" fill="#2dd4bf" />
          <path d="M-5 0 l4 4 l7 -8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Laptop */}
      <g>
        {/* Base lying on the floor */}
        <g transform={`translate(140 232) ${ISO_FLOOR}`}>
          <rect x="4" y="4" width="150" height="104" rx="10" fill="#3d3cb8" />
          <rect width="150" height="104" rx="10" fill="#dfe3fb" />
          {/* Keyboard */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 10 }).map((_, col) => (
              <rect key={`k${row}-${col}`} x={14 + col * 12.5} y={14 + row * 11} width="9" height="8" rx="1.5" fill="#2f2f76" />
            ))
          )}
          <rect x="52" y="66" width="46" height="26" rx="4" fill="#c7cdfa" />
        </g>
        {/* Screen standing up at the back edge */}
        <g transform={`translate(140 232) ${ISO_RIGHT_WALL}`}>
          <rect x="0" y="-104" width="150" height="104" rx="9" fill="#2f2f76" />
          <rect x="7" y="-97" width="136" height="88" rx="5" fill="#eef0fd" />
          <rect x="18" y="-85" width="60" height="8" rx="4" fill="#5d63e3" />
          <rect x="18" y="-70" width="110" height="6" rx="3" fill="#c7cdfa" />
          <rect x="18" y="-58" width="94" height="6" rx="3" fill="#c7cdfa" />
          <rect x="18" y="-46" width="102" height="6" rx="3" fill="#c7cdfa" />
          <rect x="18" y="-30" width="40" height="12" rx="6" fill="#2dd4bf" />
        </g>
      </g>

      {/* Chat bubble */}
      <g className="animate-float" style={{ animationDuration: "5s", animationDelay: "-2s" }}>
        <g transform="translate(40 120)">
          <rect width="46" height="34" rx="8" fill="#5d63e3" />
          <path d="M10 34 l0 10 l10 -10z" fill="#5d63e3" />
          {[13, 23, 33].map((cx) => (
            <circle key={cx} cx={cx} cy="17" r="3" fill="#fff" />
          ))}
        </g>
      </g>
    </svg>
  );
}
