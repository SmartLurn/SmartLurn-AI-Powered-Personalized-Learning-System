import VideoTile from "./VideoTile";

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

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto p-4 bg-[#faf9ff]">
      <div className="flex flex-wrap items-center justify-center gap-4 max-w-7xl w-full">
        {allParticipants.map((participant) => (
          <div
            key={participant.socketId || participant.id || participant.name}
            className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] max-w-xl flex justify-center"
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
    </div>
  );
}

export default VideoGrid;