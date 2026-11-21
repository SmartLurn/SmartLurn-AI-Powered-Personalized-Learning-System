import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Hash, MessageSquare, UsersRound, Video } from "lucide-react";
import api from "../config/api";
import Loader from "../components/Loader";
import PageHeader from "../components/PageHeader";
import MeetingActions from "../components/meeting/MeetingActions";
import EmptySessions from "../components/session/EmptySessions";
import SessionCard from "../components/session/SessionCard";
import SessionDetailsModal from "../components/session/SessionDetailsModal";

const Sessions=()=> {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Session whose details modal is currently open
  const [selectedSession, setSelectedSession] = useState(null);

  // Load the user's sessions (hosted or joined) from the backend
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { data } = await api.get("/meetings/sessions");
        setSessions(data.sessions);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load sessions");
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Study rooms"
        description="Start a room, join one with a code, or look back at past sessions."
      />

      {/* Start a new room or join one by code */}
      <section
        className="mb-6 animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Start or join a room</h2>
            <p className="mb-4 text-sm text-slate-500">
              Rooms hold up to 6 people. Share the code to invite others.
            </p>
            <MeetingActions />
          </div>

          {/* What a room includes */}
          <ul className="grid shrink-0 grid-cols-2 gap-2 rounded-xl bg-[#e8dcc4] p-3 text-[#1f3d2b] sm:grid-cols-4 md:grid-cols-2">
            {[
              { icon: UsersRound, text: "Up to 6 people" },
              { icon: Video, text: "Video & audio" },
              { icon: MessageSquare, text: "Live chat" },
              { icon: Hash, text: "Join with a code" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 rounded-lg bg-[#f3ead6] px-3 py-2 text-xs font-medium">
                <Icon size={14} className="shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">History</h2>
        {isLoading ? (
          <Loader text="Loading sessions..." />
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-surface p-6 text-center">
            <EmptySessions onStartMeeting={() => navigate("/dashboard")} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onOpenDetails={(session) => setSelectedSession(session)}
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
