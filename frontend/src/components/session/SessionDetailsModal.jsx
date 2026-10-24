
import { useState } from "react";
import { X, MessageCircle, Users, CalendarDays, Clock3 } from "lucide-react";
import SessionChatTranscript from "./SessionChatTranscript";
import SessionParticipantsLog from "./SessionParticipantsLog";

export default function SessionDetailsModal({ session, onClose }) {
  const [activeTab, setActiveTab] = useState("chat");

  if (!session) return null;

  const isEnded = session.status !== "active";

  const createdAt = new Date(session.createdAt);

  const formattedDate = createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = createdAt.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="break-all text-xs font-semibold uppercase tracking-wide text-slate-500">
              Meeting ID: {session.meetingID}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2
                id="session-details-title"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                {session.title}
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isEnded
                    ? "bg-slate-100 text-slate-600"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isEnded ? "Ended" : "Active"}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Hosted by{" "}
              <span className="font-medium text-slate-700">
                {session.host?.name || "Unknown host"}
              </span>
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formattedDate}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} />
                {formattedTime}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close session details"
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-violet-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
              activeTab === "chat"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-violet-700"
            }`}
          >
            <MessageCircle size={17} />
            Chat Transcript
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("participants")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
              activeTab === "participants"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-violet-700"
            }`}
          >
            <Users size={17} />
            Participants Log
          </button>
        </div>

        {/* Active tab content */}
        <div className="mt-5">
          {activeTab === "chat" ? (
            <SessionChatTranscript messages={session.messages ?? []} />
          ) : (
            <SessionParticipantsLog
              participants={session.participants ?? []}
            />
          )}
        </div>
      </section>
    </div>
  );
}
