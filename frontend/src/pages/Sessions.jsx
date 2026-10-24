import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import Loader from "../components/Loader";
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
    <div className="min-h-full bg-[#FAF9FF] px-4 py-6 sm:px-8">
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Study Sessions
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Review your past and active sessions, history, participant logs,
          and chat transcripts.
        </p>

        {/* Start a new room or join one by code */}
        <div className="mt-5">
          <MeetingActions />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-violet-200 bg-white p-4 text-center sm:p-8">
        {isLoading ? (
          <Loader text="Loading sessions..." />
        ) : sessions.length === 0 ? (
          <EmptySessions
            onStartMeeting={() => navigate("/dashboard")}
          />
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
