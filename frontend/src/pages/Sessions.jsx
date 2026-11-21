import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Start or join a room</h2>
        <p className="mb-4 text-sm text-slate-500">
          Rooms hold up to 6 people. Share the code to invite others.
        </p>
        <MeetingActions />
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
