
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  Users,
  Copy,
  Check,
  PhoneOff,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";

function ControlPanel({
  roomId,
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  unreadCount = 0,
  participantCount = 1,
  isHost = false,
  onEndMeeting,
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  // Clear the timeout when the component unmounts.
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Copy the meeting code, which others type into "Join Room"
  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);

      setCopied(true);
      toast.success("Meeting code copied!");

      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy meeting code:", error);
      toast.error("Unable to copy the meeting code.");
    }
  };

  const controlButtonClass =
    "flex items-center justify-center gap-2 rounded-xl px-2.5 py-2.5 text-sm font-medium transition sm:px-3 sm:py-3";

  return (
    <footer className="flex min-h-20 items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-3 sm:gap-3 sm:px-4">

      {/* LEFT: Meeting code and Copy Code */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden min-w-0 sm:block">
          <p className="text-xs text-slate-400">Meeting code</p>
          <p className="max-w-32 truncate text-sm font-semibold text-slate-700">
            {roomId}
          </p>
        </div>

        <button
          type="button"
          onClick={copyMeetingId}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          title="Copy meeting code"
          aria-label="Copy meeting code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}

          <span className="hidden sm:inline">{copied ? "Copied" : "Copy Code"}</span>
        </button>
      </div>

      {/* CENTER: Meeting Controls */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">

        {/* Microphone */}
        <button
          type="button"
          onClick={onToggleAudio}
          title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
          aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
          aria-pressed={!audioEnabled}
          className={`${controlButtonClass} ${
            audioEnabled
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          }`}
        >
          {audioEnabled ? (
            <Mic size={20} />
          ) : (
            <MicOff size={20} />
          )}

          
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={onToggleVideo}
          title={videoEnabled ? "Turn camera off" : "Turn camera on"}
          aria-label={videoEnabled ? "Turn camera off" : "Turn camera on"}
          aria-pressed={!videoEnabled}
          className={`${controlButtonClass} ${
            videoEnabled
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          }`}
        >
          {videoEnabled ? (
            <Video size={20} />
          ) : (
            <VideoOff size={20} />
          )}

        </button>

        {/* Chat */}
        <button
          type="button"
          onClick={onToggleChat}
          title={isChatOpen ? "Close chat" : "Open chat"}
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
          aria-pressed={isChatOpen}
          className={`relative ${controlButtonClass} ${
            isChatOpen
              ? "bg-brand-100 text-brand-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <MessageCircle size={20} />
          <span className="hidden md:inline">Chat</span>

          {!isChatOpen && unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Participants */}
        <button
          type="button"
          onClick={onToggleParticipants}
          title={
            isParticipantsOpen
              ? "Close participants"
              : "View participants"
          }
          aria-label="View participants"
          aria-pressed={isParticipantsOpen}
          className={`relative ${controlButtonClass} ${
            isParticipantsOpen
              ? "bg-brand-100 text-brand-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Users size={20} />

          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {participantCount}
          </span>
        </button>

        {/* End Meeting / Leave Meeting */}
        <button
          type="button"
          onClick={onEndMeeting}
          title={
            isHost
              ? "End meeting for everyone"
              : "Leave this meeting"
          }
          aria-label={isHost ? "End Meeting" : "Leave Meeting"}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-white transition sm:px-3 sm:py-3 ${
            isHost
              ? "bg-red-600 hover:bg-red-700"
              : "bg-slate-700 hover:bg-slate-800"
          }`}
        >
          <PhoneOff size={19} />

          <span className="hidden sm:inline">
            {isHost ? "End Meeting" : "Leave Meeting"}
          </span>
        </button>
      </div>

      {/* RIGHT: StudySpace Branding */}
      <div className="hidden shrink-0 items-center gap-2 xl:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
          <GraduationCap size={21} />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">
            SmartLurn
          </p>
          <p className="text-[11px] text-slate-400">
            Learn together
          </p>
        </div>
      </div>
    </footer>
  );
}

export default ControlPanel;
