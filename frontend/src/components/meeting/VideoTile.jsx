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

  return (
    <div className="relative flex h-full w-full aspect-video max-h-full items-center justify-center overflow-hidden rounded-xl bg-slate-900 shadow-md">
      {/* Video or camera-off placeholder */}
      {videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-2xl font-semibold shadow-inner">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <VideoOff size={16} />
            Camera off
          </div>
        </div>
      )}

      {/* Bottom information overlay */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-8">
        <span className="truncate text-sm font-medium text-white drop-shadow">
          {name}
          {isLocal && " (You)"}
        </span>

        {!audioEnabled && (
          <div
            className="rounded-md bg-red-500/90 p-1.5 text-white shadow"
            title="Microphone muted"
          >
            <MicOff size={15} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoTile;