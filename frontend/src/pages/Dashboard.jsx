import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  FileText,
  MessageSquare,
  Send,
  Upload,
  UsersRound,
} from "lucide-react";
import api from "../config/api";
import useAuth from "../hooks/useAuth";
import MeetingActions from "../components/meeting/MeetingActions";

const formatStudyTime = (minutes) => {
  if (minutes < 60) return { value: minutes, unit: "min" };
  return { value: (minutes / 60).toFixed(1), unit: "hr" };
};

// Last 7 days (oldest first) with how many study rooms were started each day
const getWeeklyActivity = (sessions) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - i));
    return { date, label: date.toLocaleDateString("en-IN", { weekday: "short" }), count: 0 };
  });

  sessions.forEach((session) => {
    const created = new Date(session.createdAt);
    created.setHours(0, 0, 0, 0);
    const day = days.find((d) => d.date.getTime() === created.getTime());
    if (day) day.count += 1;
  });

  return days;
};

// Grey shimmering rows shown while the dashboard data loads
function SkeletonRows({ count = 3 }) {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 p-1">
          <span className="skeleton h-10 w-10 shrink-0 rounded-lg" />
          <span className="flex-1 space-y-2">
            <span className="skeleton block h-3.5 w-2/5" />
            <span className="skeleton block h-3 w-3/5" />
          </span>
          <span className="skeleton hidden h-8 w-20 sm:block" />
        </li>
      ))}
    </ul>
  );
}

function Card({ title, action, children, className = "", style }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-surface p-5 ${className}`}
      style={style}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState("");

  const firstName = user?.name?.trim()?.split(" ")[0] || "there";

  // Load everything the dashboard shows at the same time
  useEffect(() => {
    const load = async () => {
      const [statsResult, materialsResult, sessionsResult] = await Promise.allSettled([
        api.get("/meetings/stats"),
        api.get("/materials"),
        api.get("/meetings/sessions"),
      ]);

      if (statsResult.status === "fulfilled") setStats(statsResult.value.data.stats);
      if (materialsResult.status === "fulfilled") setMaterials(materialsResult.value.data.materials);
      if (sessionsResult.status === "fulfilled") setSessions(sessionsResult.value.data.sessions);

      if ([statsResult, materialsResult, sessionsResult].some((r) => r.status === "rejected")) {
        toast.error("Some dashboard data could not be loaded");
      }
      setIsLoading(false);
    };

    load();
  }, []);

  const latestMaterial = materials[0];
  const recentRooms = sessions.slice(0, 4);
  const weeklyActivity = useMemo(() => getWeeklyActivity(sessions), [sessions]);
  const maxPerDay = Math.max(1, ...weeklyActivity.map((d) => d.count));
  const roomsThisWeek = weeklyActivity.reduce((sum, d) => sum + d.count, 0);
  const studyTime = formatStudyTime(stats?.totalMinutes || 0);

  const statCards = [
    { label: "Study time", value: studyTime.value, unit: studyTime.unit, icon: Clock3, tint: "bg-sky-50 text-sky-600" },
    { label: "Rooms joined", value: stats?.totalSessions ?? 0, icon: UsersRound, tint: "bg-brand-50 text-brand-600" },
    { label: "Study materials", value: materials.length, icon: FileText, tint: "bg-rose-50 text-rose-600" },
    { label: "Messages sent", value: stats?.messagesSent ?? 0, icon: MessageSquare, tint: "bg-amber-50 text-amber-600" },
  ];

  // Open the AI assistant with the latest PDF and the typed question
  const askAI = (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!latestMaterial) {
      navigate("/study-materials", { state: { upload: true } });
      return;
    }
    navigate("/ai-assistant", {
      state: {
        materialId: latestMaterial.id,
        title: latestMaterial.title,
        fileUrl: latestMaterial.fileUrl,
        question: question.trim(),
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-6 flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here's an overview of your learning.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/study-materials", { state: { upload: true } })}
          className="press inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-surface px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:self-auto"
        >
          <Upload size={16} />
          Upload PDF
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {statCards.map(({ label, value, unit, icon: Icon, tint }, index) => (
          <div
            key={label}
            className="card-hover animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-4 sm:p-5"
            style={{ animationDelay: `${(index + 1) * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 sm:text-sm">{label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {isLoading ? <span className="skeleton inline-block h-8 w-16 align-middle" /> : value}
              {!isLoading && unit && <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Continue learning */}
        <Card
          title="Continue learning"
          className="animate-fade-up lg:col-span-2"
          style={{ animationDelay: "300ms" }}
          action={
            <button
              type="button"
              onClick={() => navigate("/study-materials")}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600"
            >
              All materials <ArrowRight size={13} />
            </button>
          }
        >
          {latestMaterial ? (
            <ul className="space-y-2">
              {materials.slice(0, 3).map((material, index) => (
                <li
                  key={material.id}
                  className={`flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center ${
                    index === 0 ? "border-slate-100 bg-slate-50/70" : "border-transparent"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{material.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {material.subject} · {material.fileSize} · Added{" "}
                        {new Date(material.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Open <ArrowUpRight size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/ai-assistant", {
                          state: { materialId: material.id, title: material.title, fileUrl: material.fileUrl },
                        })
                      }
                      className={`press rounded-lg px-3 py-2 text-xs font-medium ${
                        index === 0
                          ? "bg-brand-600 text-white hover:bg-brand-700"
                          : "border border-slate-200 bg-surface text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Ask AI
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : isLoading ? (
            <SkeletonRows count={3} />
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No materials yet. Upload a PDF to start learning from it.
            </p>
          )}
        </Card>

        {/* Ask AI */}
        <Card title="Ask the AI assistant" className="animate-fade-up" style={{ animationDelay: "360ms" }}>
          <p className="mb-4 text-sm leading-6 text-slate-500">
            {isLoading
              ? "Loading your materials..."
              : latestMaterial
              ? <>Get explanations from <span className="font-medium text-slate-700">{latestMaterial.title}</span>.</>
              : "Upload a PDF, then ask questions about it."}
          </p>
          <form onSubmit={askAI} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-surface p-1.5 pl-3 transition focus-within:border-pop-400 focus-within:ring-4 focus-within:ring-pop-100">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={isLoading || latestMaterial ? "Ask a question..." : "Upload a PDF first"}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              aria-label="Question for the AI assistant"
            />
            <button
              type="submit"
              className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700"
              aria-label="Ask"
            >
              <Send size={15} />
            </button>
          </form>
        </Card>

        {/* Study rooms */}
        <Card
          title="Study rooms"
          className="animate-fade-up lg:col-span-2"
          style={{ animationDelay: "420ms" }}
          action={
            <button
              type="button"
              onClick={() => navigate("/sessions")}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600"
            >
              View all <ArrowRight size={13} />
            </button>
          }
        >
          <div className="mb-4">
            <MeetingActions />
          </div>

          {isLoading ? (
            <SkeletonRows count={4} />
          ) : recentRooms.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No rooms yet. Create one and share the code with friends.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentRooms.map((room) => {
                const isActive = room.status === "active";
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(isActive ? `/meeting/${encodeURIComponent(room.meetingID)}` : "/sessions")
                      }
                      className="group flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <UsersRound size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{room.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(room.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isActive && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {isActive ? "Live" : "Ended"}
                      </span>
                      <ArrowRight size={15} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Weekly activity */}
        <Card title="This week" className="animate-fade-up" style={{ animationDelay: "480ms" }}>
          <p className="-mt-2 mb-4 text-xs text-slate-500">
            {isLoading ? "Loading activity..." : `${roomsThisWeek} study ${roomsThisWeek === 1 ? "room" : "rooms"} in the last 7 days`}
          </p>
          <div className="flex h-40 items-end gap-2">
            {weeklyActivity.map((day, index) => (
              <div key={day.label + index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] font-medium text-slate-500">{day.count || ""}</span>
                <div
                  className={`w-full max-w-8 origin-bottom rounded-md ${
                    isLoading ? "skeleton" : `animate-grow-up ${index === 6 ? (day.count ? "bg-pop-500" : "bg-pop-100") : day.count ? "bg-brand-500" : "bg-slate-100"}`
                  }`}
                  style={{
                    height: isLoading ? `${30 + ((index * 37) % 50)}%` : `${Math.max(6, (day.count / maxPerDay) * 100)}%`,
                    animationDelay: `${500 + index * 50}ms`,
                  }}
                  title={`${day.count} on ${day.label}`}
                />
                <span className="text-[11px] text-slate-400">{day.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
