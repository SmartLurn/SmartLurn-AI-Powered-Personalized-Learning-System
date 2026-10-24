
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../config/api";
import Loader from "../components/Loader";
import MeetingActions from "../components/meeting/MeetingActions";
import {
  UsersRound,
  ArrowRight,
  Brain,
  ClipboardList,
  FolderOpen,
  Clock3,
} from "lucide-react";

import useAuth from "../hooks/useAuth";

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
    path: "/study-materials",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentRooms, setRecentRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  const userName = user?.name?.trim()?.split(" ")[0] || "there";

  // Load the 3 most recent meetings (active or ended)
  useEffect(() => {
    const loadRecentRooms = async () => {
      try {
        const { data } = await api.get("/meetings/sessions");

        const rooms = data.sessions
          .slice(0, 3)
          .map((session) => ({
            id: session.id,
            name: session.title,
            code: session.meetingID,
            isActive: session.status === "active",
            time: new Date(session.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            }),
          }));

        setRecentRooms(rooms);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Could not load recent rooms"
        );
      } finally {
        setIsLoadingRooms(false);
      }
    };

    loadRecentRooms();
  }, []);

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
        <section>
          <MeetingActions />
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

          {isLoadingRooms && <Loader text="Loading recent rooms..." />}

          {!isLoadingRooms && recentRooms.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
              No rooms yet. Create one to get started.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                // Active rooms can be rejoined; ended ones open their history
                onClick={() =>
                  navigate(
                    room.isActive
                      ? `/meeting/${encodeURIComponent(room.code)}`
                      : "/sessions"
                  )
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

                <div className="mt-3 flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-slate-800">
                    {room.name}
                  </h3>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      room.isActive
                        ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {room.isActive ? "Active" : "Ended"}
                  </span>
                </div>

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
