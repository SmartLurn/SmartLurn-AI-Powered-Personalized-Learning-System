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

  // Measure the space left over by the header, control bar and side panels,
  // and recalculate whenever it changes (window resize, chat opened, etc.)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculate = () => {
      const newGap = window.innerWidth < 640 ? 8 : 16;
      const width = container.clientWidth - newGap * 2; // minus padding
      const height = container.clientHeight - newGap * 2;

      setGap(newGap);
      setTileWidth(getBestTileWidth(count, width, height, newGap));
    };

    const observer = new ResizeObserver(calculate);
    observer.observe(container);

    return () => observer.disconnect();
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-wrap content-center items-center justify-center overflow-hidden bg-[#faf9ff]"
      style={{ gap, padding: gap }}
    >
      {allParticipants.map((participant) => (
        <div
          key={participant.socketId || participant.id || participant.name}
          style={{ width: tileWidth || "100%" }}
        >
          <VideoTile
            stream={participant.stream}
            name={participant.name}
            isLocal={participant.isLocal}
            audioEnabled={participant.audioEnabled}
            videoEnabled={participant.videoEnabled}
          />
        </div>
      ))}
    </div>
  );
}

export default VideoGrid;
