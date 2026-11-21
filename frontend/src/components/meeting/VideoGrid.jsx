import { useEffect, useRef, useState } from "react";
import VideoTile from "./VideoTile";

const ASPECT_RATIO = 16 / 9;

// Try every column count and keep the one that gives the biggest 16:9 tiles
// that still fit inside the available width AND height.
const getBestTileWidth = (count, width, height, gap) => {
  let bestWidth = 0;

  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const maxWidthPerTile = (width - gap * (cols - 1)) / cols;
    const maxHeightPerTile = (height - gap * (rows - 1)) / rows;
    const tileWidth = Math.min(maxWidthPerTile, maxHeightPerTile * ASPECT_RATIO);

    if (tileWidth > bestWidth) bestWidth = tileWidth;
  }

  return Math.floor(bestWidth);
};

function VideoGrid({
  localStream,
  localUser,
  remoteUsers = [],
  audioEnabled = true,
  videoEnabled = true,
}) {
  const allParticipants = [
    {
      id: "local",
      stream: localStream,
      name: localUser?.name || "You",
      isLocal: true,
      audioEnabled: audioEnabled,
      videoEnabled: videoEnabled,
    },
    ...remoteUsers.map((p) => ({
      ...p,
      isLocal: false,
    })),
  ];

  const count = allParticipants.length;
  const containerRef = useRef(null);
  const [tileWidth, setTileWidth] = useState(0);
  const [gap, setGap] = useState(16);
  const [isPortrait, setIsPortrait] = useState(false);

  // Measure the space left over by the header, control bar and side panels,
  // and recalculate whenever it changes (window resize, chat opened, etc.)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculate = () => {
      const newGap = window.innerWidth < 640 ? 8 : 16;
      const width = container.clientWidth - newGap * 2; // minus padding
      const height = container.clientHeight - newGap * 2;

      // Taller than wide = phone held upright: use the phone layouts below
      setIsPortrait(container.clientHeight > container.clientWidth);
      setGap(newGap);
      setTileWidth(getBestTileWidth(count, width, height, newGap));
    };

    const observer = new ResizeObserver(calculate);
    observer.observe(container);

    return () => observer.disconnect();
  }, [count, isPortrait]); // the container element changes when the layout switches

  const keyOf = (participant) => participant.socketId || participant.id || participant.name;

  const renderTile = (participant, fill = false) => (
    <VideoTile
      stream={participant.stream}
      name={participant.name}
      isLocal={participant.isLocal}
      audioEnabled={participant.audioEnabled}
      videoEnabled={participant.videoEnabled}
      connectionState={participant.connectionState}
      fill={fill}
    />
  );

  // Phone, 2 people: the other person fills the screen, you are a small corner preview
  if (isPortrait && count === 2) {
    const [local, remote] = allParticipants;

    return (
      <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-canvas p-2">
        <div key={keyOf(remote)} className="h-full w-full">
          {renderTile(remote, true)}
        </div>

        <div
          key={keyOf(local)}
          className="absolute bottom-4 right-4 z-20 aspect-[3/4] w-28 rounded-xl ring-2 ring-white sm:w-36"
        >
          {renderTile(local, true)}
        </div>
      </div>
    );
  }

  // Phone, 1 or 3-6 people: a grid that fills the whole screen
  if (isPortrait) {
    const columns = count === 1 ? 1 : 2;
    const rows = Math.ceil(count / columns);

    return (
      <div
        ref={containerRef}
        className="grid h-full w-full overflow-hidden bg-canvas"
        style={{
          gap,
          padding: gap,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {allParticipants.map((participant, index) => (
          <div
            key={keyOf(participant)}
            // With an odd number of people the last tile uses the full width
            className={`min-h-0 ${
              columns === 2 && count % 2 === 1 && index === count - 1 ? "col-span-2" : ""
            }`}
          >
            {renderTile(participant, true)}
          </div>
        ))}
      </div>
    );
  }

  // Laptop / landscape: biggest 16:9 tiles that fit
  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-wrap content-center items-center justify-center overflow-hidden bg-canvas"
      style={{ gap, padding: gap }}
    >
      {allParticipants.map((participant) => (
        <div key={keyOf(participant)} style={{ width: tileWidth || "100%" }}>
          {renderTile(participant)}
        </div>
      ))}
    </div>
  );
}

export default VideoGrid;
