import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, Check, Clock3, Plus, RotateCcw } from "lucide-react";
import PageHeader from "../components/PageHeader";

// UI preview only: sample plan, nothing is saved yet

const SUBJECT_COLORS = {
  "Database Systems": "bg-brand-50 text-brand-700",
  "Operating Systems": "bg-sky-50 text-sky-700",
  "Computer Networks": "bg-amber-50 text-amber-700",
  Algorithms: "bg-emerald-50 text-emerald-700",
};

const SAMPLE_TASKS = [
  { id: 1, title: "Revise normalization (1NF–BCNF)", subject: "Database Systems", minutes: 45, done: true },
  { id: 2, title: "Practice CPU scheduling problems", subject: "Operating Systems", minutes: 30, done: true },
  { id: 3, title: "Go through OSI vs TCP/IP notes", subject: "Computer Networks", minutes: 25, done: false },
  { id: 4, title: "Quiz: transactions & ACID", subject: "Database Systems", minutes: 15, done: false },
  { id: 5, title: "Solve 3 dynamic programming questions", subject: "Algorithms", minutes: 40, done: false },
];

const UPCOMING = [
  { topic: "Deadlocks", subject: "Operating Systems", due: "Tomorrow", round: "2nd review" },
  { topic: "Indexing & B+ trees", subject: "Database Systems", due: "In 3 days", round: "3rd review" },
  { topic: "Subnetting", subject: "Computer Networks", due: "In 5 days", round: "1st review" },
  { topic: "Greedy algorithms", subject: "Algorithms", due: "Next week", round: "2nd review" },
];

const comingSoon = () => toast("Coming soon", { id: "coming-soon" });

// Monday to Sunday of the current week
const getWeek = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { date, isToday: date.getTime() === today.getTime(), tasks: [2, 3, 1, 4, 2, 0, 1][i] };
  });
};

export default function Revision() {
  const week = useMemo(() => getWeek(), []);
  const [selectedDay, setSelectedDay] = useState(week.findIndex((d) => d.isToday));
  const [tasks, setTasks] = useState(SAMPLE_TASKS);

  const doneCount = tasks.filter((t) => t.done).length;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.minutes, 0);
  const percent = Math.round((doneCount / tasks.length) * 100);

  const toggleTask = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Revision planner"
        badge="Preview"
        description="Plan what to revise each day and review topics before you forget them."
        actions={
          <button
            type="button"
            onClick={comingSoon}
            className="press inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Add task
          </button>
        }
      />

      {/* Week strip */}
      <div className="mb-5 grid animate-fade-up grid-cols-7 gap-2" style={{ animationDelay: "60ms" }}>
        {week.map(({ date, isToday, tasks: count }, index) => {
          const isSelected = index === selectedDay;
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedDay(index)}
              className={`press flex flex-col items-center gap-1 rounded-xl border py-3 transition ${
                isSelected
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                  : "border-slate-200/80 bg-surface text-slate-700 hover:border-brand-200"
              }`}
            >
              <span className={`text-[11px] font-medium uppercase ${isSelected ? "text-brand-100" : "text-slate-400"}`}>
                {date.toLocaleDateString("en-IN", { weekday: "short" })}
              </span>
              <span className="text-lg font-semibold">{date.getDate()}</span>
              <span className="flex h-1.5 gap-0.5">
                {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-brand-300"}`} />
                ))}
              </span>
              {isToday && !isSelected && <span className="sr-only">Today</span>}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Tasks */}
        <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5 lg:col-span-2" style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {week[selectedDay]?.isToday
                  ? "Today's plan"
                  : week[selectedDay]?.date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
              </h2>
              <p className="text-xs text-slate-500">
                {doneCount} of {tasks.length} done · about {totalMinutes} min
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-brand-600">{percent}%</span>
          </div>

          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>

          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50/60"
                  aria-pressed={task.done}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      task.done ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 group-hover:border-brand-400"
                    }`}
                  >
                    {task.done && <Check size={13} strokeWidth={3} className="animate-pop-in" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-medium transition ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {task.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${SUBJECT_COLORS[task.subject]}`}>
                        {task.subject}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock3 size={12} /> {task.minutes} min
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Upcoming reviews */}
        <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5" style={{ animationDelay: "180ms" }}>
          <div className="mb-1 flex items-center gap-2">
            <RotateCcw size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Upcoming reviews</h2>
          </div>
          <p className="mb-4 text-xs leading-5 text-slate-500">
            Topics come back at growing gaps (1, 3, 7 days) so they stay in memory.
          </p>

          <ul className="space-y-2.5">
            {UPCOMING.map((item, index) => (
              <li
                key={item.topic}
                className="card-hover animate-fade-up rounded-xl border border-slate-100 p-3.5"
                style={{ animationDelay: `${240 + index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{item.topic}</p>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-500">
                    <CalendarClock size={12} /> {item.due}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${SUBJECT_COLORS[item.subject]}`}>
                    {item.subject}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.round}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
