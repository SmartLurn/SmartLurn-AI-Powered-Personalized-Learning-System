import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../config/api";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";
import VideoGrid from "../components/meeting/VideoGrid";
import useWebRTC from "../hooks/useWebRTC";
import useChat from "../hooks/useChat";
import ChatPanel from "../components/meeting/ChatPanel";
import ParticipantsList from "../components/meeting/ParticipantsList";
import ControlPanel from "../components/meeting/ControlPanel";

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  // Load the meeting details (title, host) from the backend
  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const { data } = await api.get(`/meetings/${encodeURIComponent(meetingId)}`);
        setMeeting(data.meeting);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load meeting");
        navigate("/dashboard");
      }
    };

    loadMeeting();
  }, [meetingId, navigate]);

  // Called when the server says the meeting is over (or not found)
  const handleMeetingEnded = useCallback((message) => {
    if (message) toast(message);
    navigate("/dashboard");
  }, [navigate]);

  // Initialize WebRTC hook
  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  } = useWebRTC({ roomId: meetingId, user, onMeetingEnded: handleMeetingEnded });

  const isHost = meeting?.host === user?.id;

  // Initialize Chat hook
  const {
    messages,
    unreadCount,
    isChatOpen,
    sendMessage,
    toggleChat,
  } = useChat(meetingId, user);

  // Only one side panel at a time so the video always has room
  const handleToggleChat = () => {
    setIsParticipantsOpen(false);
    toggleChat();
  };

  const handleToggleParticipants = () => {
    if (isChatOpen) toggleChat();
    setIsParticipantsOpen((prev) => !prev);
  };

  const handleLeaveMeeting = () => {
    toast("You have left the meeting");
    navigate("/dashboard");
  };

  const handleEndMeeting = () => {
    endMeeting();
    toast("Meeting ended for all participants");
    navigate("/dashboard");
  };

  // Wait for the meeting details so the title and host controls are correct
  if (!meeting) {
    return <Loader text="Joining meeting..." fullScreen />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#faf9ff]">
      {/* Meeting Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="min-w-0 truncate text-base font-semibold text-slate-800 sm:text-lg">
          {meeting?.title || "Study Room"}
          <span className="ml-2 hidden text-sm font-normal text-slate-400 sm:inline">
            ({meetingId})
          </span>
        </h1>

        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Active
        </span>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Video area takes all remaining space */}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <VideoGrid
            localStream={localStream}
            localUser={user}
            remoteUsers={remoteUsers}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
          />
        </div>

        {/* Chat panel stays against the right edge */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={toggleChat}
          messages={messages}
          onSendMessage={sendMessage}
          currentUser={user}
        />

        <ParticipantsList
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          localUser={user}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostId={meeting?.host}
        />
      </div>

      <ControlPanel
        roomId={meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={handleToggleChat}
        onToggleParticipants={handleToggleParticipants}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        participantCount={1 + remoteUsers.length}
        isHost={isHost}
        onEndMeeting={isHost ? handleEndMeeting : handleLeaveMeeting}
      />
    </div>
  );
}