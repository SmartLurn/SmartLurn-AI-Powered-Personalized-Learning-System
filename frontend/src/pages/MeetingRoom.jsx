import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import VideoGrid from "../components/meeting/VideoGrid";
import useWebRTC from "../hooks/useWebRTC";
import useChat from "../hooks/useChat";
import ChatPanel from "../components/meeting/ChatPanel";
import ParticipantsList from "../components/meeting/ParticipantsList";
import ControlPanel from "../components/meeting/ControlPanel";

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const userdata = {
    id: "user_mock_001",
    fullName: "Alex Rivera",
    firstName: "Alex",
    lastName: "Rivera",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const handleMeetingEnded = useCallback(() => {
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
  } = useWebRTC(meetingId, userdata, handleMeetingEnded);
  
  const isHost = true;

  // Initialize Chat hook
  const {
    messages,
    unreadCount,
    isChatOpen,
    sendMessage,
    toggleChat,
  } = useChat(meetingId, userdata);

  const handleLeaveMeeting = () => {
    toast("You have left the meeting");
    navigate("/dashboard");
  };

  const handleEndMeeting = () => {
    endMeeting();
    toast("Meeting ended for all participants");
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#faf9ff]">
      {/* Meeting Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-800">
          Study Room
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({meetingId})
          </span>
        </h1>

        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Active
        </span>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Video area takes all remaining space */}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <VideoGrid
            localStream={localStream}
            localUser={userdata}
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
          currentUser={userdata}
        />

        <ParticipantsList
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          localUser={userdata}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostId={userdata.id}
        />
      </div>

      <ControlPanel
        roomId={meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={() => setIsParticipantsOpen((prev) => !prev)}
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