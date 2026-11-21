
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../config/api";
import Loader from "../components/Loader";
import MeetingActions from "../components/meeting/MeetingActions";
import StudyIllustration from "../components/StudyIllustration";
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
    color: "bg-brand-100 text-brand-600",
  },
  {
    title: "Summaries & Quizzes",
    description: "Revise and test your knowledge.",
    icon: ClipboardList,
    path: "/summaries-quizzes",
    color: "bg-leaf-100 text-leaf-600",
  },
  {
    title: "My Files",
    description: "Access your saved materials.",
    icon: FolderOpen,
    path: "/study-materials",
    color: "bg-peach text-brand-700",
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
    <div className="min-h-full bg-cream px-5 py-5 sm:px-7">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Welcome banner with Create / Join room */}
        <section className="relative overflow-hidden rounded-3xl bg-leaf-500 p-6 text-white shadow-lg shadow-leaf-200 sm:p-8">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-leaf-400/50" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-56 w-56 rounded-full bg-leaf-600/40" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg">
              <span className="inline-block rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold tracking-wide">
                YOUR STUDY SPACE
              </span>

              <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
                Hey, {userName}! Travel into the world of knowledge
              </h1>

              <p className="mt-2 text-sm text-leaf-50/90">
                Ready to make today a productive study session?
              </p>

              <div className="mt-5 rounded-2xl bg-white/95 p-3 text-slate-800">
                <MeetingActions />
              </div>
            </div>

            <StudyIllustration className="hidden w-64 shrink-0 md:block lg:w-80" />
          </div>
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
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          {isLoadingRooms && <Loader text="Loading recent rooms..." />}

          {!isLoadingRooms && recentRooms.length === 0 && (
            <p className="rounded-2xl border border-dashed border-brand-200 bg-white p-4 text-xs text-slate-500">
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
                className="group rounded-2xl border border-brand-100 bg-white p-4 text-left transition hover:border-brand-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-100 text-leaf-600">
                    <UsersRound size={17} />
                  </div>

                  <ArrowRight
                    size={15}
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
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
                  className="group flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4 text-left transition hover:border-brand-200 hover:shadow-sm"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
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
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
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
