import { BookCheck, Clock3, ListChecks, Target, TrendingUp } from "lucide-react";
import PageHeader from "../components/PageHeader";

// UI preview only: sample numbers, nothing is tracked yet

const STATS = [
  { label: "Overall progress", value: "68", unit: "%", change: "+12% this month", icon: Target, tint: "bg-brand-50 text-brand-600" },
  { label: "Study time this week", value: "12.5", unit: "hr", change: "+2.1 hr vs last week", icon: Clock3, tint: "bg-sky-50 text-sky-600" },
  { label: "Quizzes taken", value: "8", change: "3 this week", icon: ListChecks, tint: "bg-amber-50 text-amber-600" },
  { label: "Topics completed", value: "6", unit: "/ 14", change: "2 this week", icon: BookCheck, tint: "bg-emerald-50 text-emerald-600" },
];

const SUBJECTS = [
  { name: "Database Systems", progress: 85 },
  { name: "Operating Systems", progress: 72 },
  { name: "Computer Networks", progress: 68 },
  { name: "Software Engineering", progress: 60 },
  { name: "Algorithms", progress: 41 },
];

const WEEK_HOURS = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2.5 },
  { day: "Wed", hours: 1 },
  { day: "Thu", hours: 3 },
  { day: "Fri", hours: 2 },
  { day: "Sat", hours: 0.5 },
  { day: "Sun", hours: 2 },
];

const RECENT_QUIZZES = [
  { title: "DBMS – Normalization", score: 9, total: 10, date: "Today" },
  { title: "OS – Scheduling", score: 7, total: 10, date: "Yesterday" },
  { title: "CN – OSI Model", score: 6, total: 10, date: "18 Nov" },
];

const QUIZ_AVERAGE = 82;

// Donut chart for the quiz average
function Donut({ percent }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 128 128" className="h-36 w-36 -rotate-90" role="img" aria-label={`${percent}% average score`}>
      <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100" />
      <circle
        cx="64"
        cy="64"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-pop-500 transition-[stroke-dashoffset] duration-1000"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - percent / 100)}
      />
    </svg>
  );
}

export default function Progress() {
  const maxHours = Math.max(...WEEK_HOURS.map((d) => d.hours));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Your progress"
        badge="Preview"
        description="See how you're doing across subjects and quizzes."
      />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {STATS.map(({ label, value, unit, change, icon: Icon, tint }, index) => (
          <div
            key={label}
            className="card-hover animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-4 sm:p-5"
            style={{ animationDelay: `${(index + 1) * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 sm:text-sm">{label}</span>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {value}
              {unit && <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span>}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp size={13} /> {change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Subjects */}
        <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5 lg:col-span-2" style={{ animationDelay: "300ms" }}>
          <h2 className="mb-5 text-sm font-semibold text-slate-900">Progress by subject</h2>
          <ul className="space-y-5">
            {SUBJECTS.map(({ name, progress }, index) => (
              <li key={name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{name}</span>
                  <span className="tabular-nums text-slate-500">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full origin-left animate-grow-x rounded-full bg-brand-500"
                    style={{ width: `${progress}%`, animationDelay: `${350 + index * 80}ms` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Quiz performance */}
        <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5" style={{ animationDelay: "360ms" }}>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Quiz performance</h2>
          <div className="flex flex-col items-center">
            <div className="relative">
              <Donut percent={QUIZ_AVERAGE} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-slate-900">{QUIZ_AVERAGE}%</span>
                <span className="text-xs text-slate-500">Average score</span>
              </div>
            </div>
            <div className="mt-4 flex gap-5 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-pop-500" /> Correct {QUIZ_AVERAGE}%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-200" /> Incorrect {100 - QUIZ_AVERAGE}%
              </span>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
            {RECENT_QUIZZES.map((quiz) => (
              <li key={quiz.title} className="flex items-center justify-between py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-800">{quiz.title}</span>
                  <span className="text-xs text-slate-400">{quiz.date}</span>
                </span>
                <span className="shrink-0 tabular-nums font-medium text-slate-700">
                  {quiz.score}/{quiz.total}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Weekly hours */}
        <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5 lg:col-span-3" style={{ animationDelay: "420ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Study hours this week</h2>
            <span className="text-xs text-slate-500">
              {WEEK_HOURS.reduce((sum, d) => sum + d.hours, 0)} hr total
            </span>
          </div>
          <div className="flex h-44 items-end gap-3 sm:gap-6">
            {WEEK_HOURS.map(({ day, hours }, index) => (
              <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] font-medium text-slate-500">{hours}h</span>
                <div
                  className="w-full max-w-12 origin-bottom animate-grow-up rounded-md bg-brand-500"
                  style={{ height: `${(hours / maxHours) * 100}%`, animationDelay: `${480 + index * 50}ms` }}
                />
                <span className="text-[11px] text-slate-400">{day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
