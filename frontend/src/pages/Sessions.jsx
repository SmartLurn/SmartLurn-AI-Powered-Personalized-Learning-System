import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EmptySessions from "../components/session/EmptySessions";
import SessionCard from "../components/session/SessionCard";
import SessionDetailsModal from "../components/session/SessionDetailsModal";

const Sessions=()=> {
  const navigate = useNavigate();

  // Temporary dummy data
  const [sessions, setSessions] = useState([
    {
      id: "session-001",
      meetingID: "study-room-123",
      title: "Data Structures Revision",
      status: "active",
      host: {
        id: "user-001",
        name: "Alex Rivera",
      },
      createdAt: "2026-10-24T14:00:00",
      participants: [
        {
          id: "user-001",
          name: "Alex Rivera",
          isHost: true,
          joinedAt: "2026-10-24T14:00:00",
        },
        {
          id: "user-002",
          name: "Aarav Sharma",
          isHost: false,
          joinedAt: "2026-10-24T14:05:00",
        },
        {
          id: "user-003",
          name: "Priya Singh",
          isHost: false,
          joinedAt: "2026-10-24T14:10:00",
        },
      ],
      messages: [
        {
          id: "msg-001",
          senderId: "user-002",
          senderName: "Aarav Sharma",
          text: "Let's start with linked lists.",
          sentAt: "2026-10-24T14:10:00",
        },
        {
          id: "msg-002",
          senderId: "user-003",
          senderName: "Priya Singh",
          text: "Sure, I have my notes ready.",
          sentAt: "2026-10-24T14:11:00",
        },
      ],
    },
    {
      id: "session-002",
      meetingID: "study-room-456",
      title: "Operating Systems Study Group",
      status: "ended",
      host: {
        id: "user-004",
        name: "Riya Kapoor",
      },
      createdAt: "2026-10-23T16:00:00",
      endedAt: "2026-10-23T17:30:00",
      participants: [
        {
          id: "user-004",
          name: "Riya Kapoor",
          isHost: true,
          joinedAt: "2026-10-23T16:00:00",
        },
        {
          id: "user-005",
          name: "Kabir Verma",
          isHost: false,
          joinedAt: "2026-10-23T16:08:00",
        },
      ],
      messages: [],
    },
  ]);

  // Session whose details modal is currently open
  const [selectedSession, setSelectedSession] = useState(null);

  // Default tab inside the details modal
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-4 py-6 sm:px-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
      >
        <ArrowLeft size={18} />
        Go to Dashboard
      </button>

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Study Sessions
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Review your past and active sessions, history, participant logs,
          and chat transcripts.
        </p>
      </div>

      {/* Session content will be added next */}
      <div className="rounded-2xl border border-dashed border-violet-200 bg-white p-8 text-center">
             {sessions.length === 0 ? (
  <EmptySessions
    onStartMeeting={() => navigate("/dashboard")}
  />
) : (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {sessions.map((session) => (
      <SessionCard
        key={session.id}
        session={session}
        onOpenDetails={(session) => {
          setSelectedSession(session);
          setActiveTab("chat");
        }}
        onRejoin={(session) => {
          navigate(`/meeting/${session.meetingID}`);
        }}
      />
    ))}

    {selectedSession && (
  <SessionDetailsModal
    session={selectedSession}
    onClose={() => setSelectedSession(null)}
  />
)}
  </div>
)}
      </div>
    </div>
  );
}

export default Sessions