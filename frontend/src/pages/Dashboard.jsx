
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  UsersRound,
  ArrowRight,
  Brain,
  ClipboardList,
  FolderOpen,
  Clock3,
  Keyboard,
  LoaderCircle,
} from "lucide-react";

import useAuth from "../hooks/useAuth";

const recentRooms = [
  {
    id: "1",
    name: "DSA Preparation",
    code: "DSA123",
    time: "2 hours ago",
  },
  {
    id: "2",
    name: "DBMS Revision",
    code: "DBMS45",
    time: "Yesterday",
  },
  {
    id: "3",
    name: "Group Study",
    code: "GRP789",
    time: "3 days ago",
  },
];

const quickLinks = [
  {
    title: "AI Study Assistant",
    description: "Ask questions and learn topics.",
    icon: Brain,
    path: "/ai-assistant",
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "Summaries & Quizzes",
    description: "Revise and test your knowledge.",
    icon: ClipboardList,
    path: "/summaries-quizzes",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "My Files",
    description: "Access your saved materials.",
    icon: FolderOpen,
    path: "/materials",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [joinId, setJoinId] = useState("");

  const userName = user?.name?.trim()?.split(" ")[0] || "there";

  // Create a new meeting 
  const handleCreateMeeting = () => {
    if (isCreating) return;

    setIsCreating(true);

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const generateSegment = () =>
      Array.from({ length: 3 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");

    const meetingId = `${generateSegment()}-${generateSegment()}-${generateSegment()}`;

    setTimeout(() => {
      toast.success("Meeting created successfully!");
      navigate(`/meeting/${meetingId}`);
      setIsCreating(false);
    }, 400);
  };

  // Join Meeting 
  const handleJoinMeeting = (event) => {
    event.preventDefault();

    const cleanId = joinId.trim();

    if (!cleanId) {
      toast.error("Please enter a valid meeting ID.");
      return;
    }

    navigate(`/meeting/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="min-h-full bg-[#faf9ff] px-5 py-5 sm:px-7">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Welcome */}
        <section>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-violet-500">
            YOUR STUDY SPACE
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Hey, {userName}! 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Ready to make today a productive study session?
          </p>
        </section>

        {/* Create and Join Room */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

  {/* Create Room Button */}
  <button
    type="button"
    onClick={handleCreateMeeting}
    disabled={isCreating}
    className="flex w-auto items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
  >
    {isCreating ? (
      <>
        <LoaderCircle size={14} className="animate-spin" />
        Creating...
      </>
    ) : (
      <>
        <Plus size={14} />
        Create Room
      </>
    )}
  </button>

  {/* Join Room Form (Input + Join Button) */}
  <form
    onSubmit={handleJoinMeeting}
    className="flex items-center gap-2"
  >
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
      <Keyboard
        size={15}
        className="shrink-0 text-slate-400"
      />

      <input
        type="text"
        value={joinId}
        onChange={(event) => setJoinId(event.target.value)}
        placeholder="Enter meeting ID"
        aria-label="Meeting ID"
        className="min-w-0 w-full bg-transparent py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>

    <button
      type="submit"
      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-violet-700"
    >
      Join
      <ArrowRight size={13} />
    </button>
  </form>

        </section>

        {/* Recent Rooms */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Recent Rooms
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Pick up where you left off.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/sessions")}
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() =>
                  navigate(`/meeting/${encodeURIComponent(room.code)}`)
                }
                className="group rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-violet-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <UsersRound size={17} />
                  </div>

                  <ArrowRight
                    size={15}
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500"
                  />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-800">
                  {room.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Code: {room.code}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock3 size={12} />
                  {room.time}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Access */}
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-800">
              Quick Access
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Your study tools, all in one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-violet-200 hover:shadow-sm"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500"
                  />
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
