import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Clock3,
  Crown,
  FileText,
  LoaderCircle,
  Mail,
  MessageCircle,
  Save,
  UsersRound,
} from "lucide-react";
import api from "../config/api";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";

// 135 -> "2h 15m", 40 -> "40m"
const formatMinutes = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function Profile() {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [materialCount, setMaterialCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load profile, meeting stats and materials together
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, statsRes, materialsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/meetings/stats"),
          api.get("/materials"),
        ]);

        setProfile(profileRes.data.user);
        setName(profileRes.data.user.name);
        setEmail(profileRes.data.user.email);
        setStats(statsRes.data.stats);
        setMaterialCount(materialsRes.data.materials.length);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load your profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const hasChanges =
    profile && (name.trim() !== profile.name || email.trim() !== profile.email);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      const { data } = await api.patch("/users/me", { name, email });

      setProfile(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      updateUser({ name: data.user.name, email: data.user.email });

      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader text="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        Your profile could not be loaded. Please refresh the page.
      </p>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statCards = [
    { label: "Study sessions", value: stats?.totalSessions ?? 0, icon: UsersRound, color: "bg-violet-100 text-violet-600" },
    { label: "Rooms hosted", value: stats?.hostedSessions ?? 0, icon: Crown, color: "bg-amber-100 text-amber-600" },
    { label: "Time in rooms", value: formatMinutes(stats?.totalMinutes), icon: Clock3, color: "bg-emerald-100 text-emerald-600" },
    { label: "Messages sent", value: stats?.messagesSent ?? 0, icon: MessageCircle, color: "bg-blue-100 text-blue-600" },
    { label: "Materials uploaded", value: materialCount, icon: FileText, color: "bg-rose-100 text-rose-600" },
  ];

  return (
    <div className="min-h-full bg-[#faf9ff] px-4 py-6 sm:px-7">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your account details and study activity.
          </p>
        </div>

        {/* Profile card */}
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-3xl font-bold text-white shadow-md">
            {profile.name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-slate-800">
              {profile.name}
            </h2>

            <p className="mt-1 flex items-center justify-center gap-1.5 truncate text-sm text-slate-500 sm:justify-start">
              <Mail size={15} className="shrink-0" />
              {profile.email}
            </p>

            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 sm:justify-start">
              <CalendarDays size={14} className="shrink-0" />
              Member since {memberSince}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-800">
            Study activity
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Edit profile */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-800">
            Edit profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This name is shown to others in study rooms.
          </p>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!hasChanges || isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Profile;
