import {
  CalendarDays,
  Clock3,
  Users,
  MessageCircle,
  Eye,
  RotateCcw,
} from "lucide-react";

function SessionCard({
  session,
  onOpenDetails,
  onRejoin,
}) {
  const isEnded = session.status === "ended";

  const participantCount = session.participants?.length ?? 0;
  const messageCount = session.messages?.length ?? 0;

  const displayMessageCount =
    messageCount > 99 ? "99+" : messageCount;

  const createdAt = new Date(session.createdAt);

  const formattedDate = createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = createdAt.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <article className="flex flex-col justify-between rounded-xl border border-violet-100 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div>
        {/* Session ID and status */}
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {session.id}
          </p>

          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              isEnded
                ? "bg-slate-100 text-slate-600"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            {isEnded ? "Ended" : "Active"}
          </span>
        </div>

        {/* Session title */}
        <h2 className="mt-2.5 text-base font-semibold text-slate-800 line-clamp-1">
          {session.title}
        </h2>

        {/* Date and time */}
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-violet-500 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock3 size={14} className="text-violet-500 shrink-0" />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="my-3.5 border-t border-slate-100" />

        {/* Participant and message counts */}
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Users size={15} className="text-violet-500 shrink-0" />
            <span>{participantCount} participants</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MessageCircle size={15} className="text-violet-500 shrink-0" />
            <span>{displayMessageCount} messages</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => onOpenDetails(session)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-50"
        >
          <Eye size={14} />
          View Details
        </button>

        {!isEnded && (
          <button
            type="button"
            onClick={() => onRejoin(session)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700 shadow-sm"
          >
            <RotateCcw size={14} />
            Rejoin
          </button>
        )}
      </div>
    </article>
  );
}

export default SessionCard;