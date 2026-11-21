import { useEffect, useRef, useState } from "react";
import { MicOff, VideoOff, Volume2 } from "lucide-react";

function VideoTile({
  stream,
  name,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  connectionState,
  // fill = take the full height of the parent (phone layouts) instead of a fixed 16:9 box
  fill = false,
}) {
  const videoRef = useRef(null);

  // Phones (especially iPhone) may block a video with sound from starting by itself
  const [needsTap, setNeedsTap] = useState(false);

  // Attach the participant's media stream to the video element and start it
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && stream) {
      videoElement.srcObject = stream;
      videoElement.play().catch(() => {
        if (!isLocal) setNeedsTap(true);
      });
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  const showVideo = videoEnabled && stream;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-[#0b1410] shadow-md ${
        fill ? "h-full" : "aspect-video"
      }`}
    >
      {/* The video element always stays mounted: remote audio plays through it,
          so removing it when the camera is off would also mute the person. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        // Your own preview is mirrored like a selfie camera (your left stays on the left).
        // Other people's videos are not mirrored, and they see you the right way round.
        className={`h-full w-full object-cover ${isLocal ? "-scale-x-100" : ""} ${showVideo ? "" : "hidden"}`}
      />

      {/* Camera-off placeholder */}
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold shadow-inner sm:h-16 sm:w-16 sm:text-2xl">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          {/* Hidden on small tiles so it doesn't overlap the name */}
          <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
            <VideoOff size={16} />
            Camera off
          </div>
        </div>
      )}

      {/* Connection status for other people's tiles while not connected */}
      {!isLocal && ["new", "checking", "failed", "disconnected"].includes(connectionState) && (
        <div
          className={`absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow ${
            connectionState === "failed" || connectionState === "disconnected"
              ? "bg-red-500/90"
              : "bg-black/60"
          }`}
        >
          {connectionState === "failed"
            ? "Can't connect (network blocked)"
            : connectionState === "disconnected"
            ? "Reconnecting..."
            : "Connecting..."}
        </div>
      )}

      {/* Shown when the browser blocked playback; a tap is allowed to start it */}
      {needsTap && (
        <button
          type="button"
          onClick={() => {
            videoRef.current?.play().catch(() => {});
            setNeedsTap(false);
          }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2">
            <Volume2 size={16} />
            Tap to hear {name}
          </span>
        </button>
      )}

      {/* Bottom information overlay */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2 pt-6 sm:pb-3 sm:pt-8">
        <span className="truncate text-xs font-medium text-white drop-shadow sm:text-sm">
          {name}
          {isLocal && " (You)"}
        </span>

        {!audioEnabled && (
          <div
            className="shrink-0 rounded-md bg-red-500/90 p-1 text-white shadow sm:p-1.5"
            title="Microphone muted"
          >
            <MicOff size={14} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoTile;
