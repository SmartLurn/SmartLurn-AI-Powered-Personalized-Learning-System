
import { useMemo } from "react";
import {
  X,
  Users,
  Crown,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";

function ParticipantList({
  isOpen,
  onClose,
  localUser,
  localAudio,
  localVideo,
  remoteUsers = [],
  meetingHostId,
}) {
  if (!isOpen) return null;

  const allParticipants = useMemo(
    () => [
      {
        socketId: "local",
        userId: localUser?.id,
        name: localUser?.fullName || localUser?.name || "You",
        audioEnabled: localAudio,
        videoEnabled: localVideo,
        isLocal: true,
      },
      ...remoteUsers,
    ],
    [localUser, localAudio, localVideo, remoteUsers]
  );

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-violet-600" />
          <h2 className="font-semibold text-slate-800">
            Participants
          </h2>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            {allParticipants.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Close participants"
        >
          <X size={20} />
        </button>
      </div>

      {/* Participant list */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {allParticipants.map((p) => {
          const isHost = p.userId === meetingHostId;

          return (
            <div
              key={p.socketId}
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                {p.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              {/* Name and host label */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-slate-800">
                    {p.isLocal ? "You" : p.name}
                  </span>

                  {isHost && (
                    <span
                      title="Meeting host"
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-amber-600"
                    >
                      <Crown size={12} />
                      <span className="text-[10px] font-medium">
                        Host
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Microphone status */}
              <span
                title={p.audioEnabled ? "Microphone on" : "Microphone off"}
                className={
                  p.audioEnabled
                    ? "text-slate-400"
                    : "rounded-md bg-red-50 p-1 text-red-500"
                }
              >
                {p.audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              </span>

              {/* Camera status */}
              <span
                title={p.videoEnabled ? "Camera on" : "Camera off"}
                className={
                  p.videoEnabled
                    ? "text-slate-400"
                    : "rounded-md bg-red-50 p-1 text-red-500"
                }
              >
                {p.videoEnabled ? (
                  <Video size={16} />
                ) : (
                  <VideoOff size={16} />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParticipantList;
