import { useEffect, useRef } from "react";
import { MicOff, VideoOff } from "lucide-react";

function VideoTile({
  stream,
  name,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
}) {
  const videoRef = useRef(null);

  // Attach the participant's media stream to the video element
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && stream) {
      videoElement.srcObject = stream;
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  const showVideo = videoEnabled && stream;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 shadow-md">
      {/* The video element always stays mounted: remote audio plays through it,
          so removing it when the camera is off would also mute the person. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        // No mirroring: every tile (including your own) shows the true camera image
        className={`h-full w-full object-cover ${showVideo ? "" : "hidden"}`}
      />

      {/* Camera-off placeholder */}
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white sm:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold shadow-inner sm:h-16 sm:w-16 sm:text-2xl">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          {/* Hidden on small tiles so it doesn't overlap the name */}
          <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
            <VideoOff size={16} />
            Camera off
          </div>
        </div>
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
