
import { Video, CalendarDays } from "lucide-react";

const EmptySessions=({ onStartMeeting })=> {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-violet-100 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <CalendarDays size={32} />
      </div>

      <h2 className="text-xl font-semibold text-slate-800">
        No meeting history yet
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Once you create or join meeting calls, your meeting sessions,
        participants, and chat logs will appear here.
      </p>

      <button
        type="button"
        onClick={onStartMeeting}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        <Video size={18} />
        Start a Meeting
      </button>
    </div>
  );
}

export default EmptySessions