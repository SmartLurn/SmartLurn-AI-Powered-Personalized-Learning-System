
import { useMemo } from "react";
import { Crown, Clock3, Users } from "lucide-react";

export default function SessionParticipantsLog({ participants = [] }) {
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;

      return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
    });
  }, [participants]);

  if (sortedParticipants.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-4 py-10 text-center">
        <Users size={30} className="mb-4 text-violet-500" />

        <h3 className="font-semibold text-slate-800">
          No participant records
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Participant attendance will appear here when records are available.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-80 space-y-3 overflow-y-auto p-1">
      {sortedParticipants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
            {participant.name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-800">
                {participant.name || "Unknown participant"}
              </p>

              {participant.isHost && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  <Crown size={13} />
                  Host
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 size={13} />

              <span>
                Joined{" "}
                {participant.joinedAt
                  ? new Date(participant.joinedAt).toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )
                  : "time unavailable"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
