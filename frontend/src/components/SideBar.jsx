import { NavLink } from "react-router-dom";
import {
  Sparkles,
  LayoutDashboard,
  UsersRound,
  PanelTop,
  Sparkle,
  List,
  ChartNoAxesColumn,
  Clock3,
  CircleUserRound,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import useAuth  from "../hooks/useAuth";

const navigation = [
  {
    heading: "WORKSPACE",
    links: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Study Rooms", path: "/sessions", icon: UsersRound },
      { label: "Study Materials", path: "/study-materials", icon: PanelTop },
    ],
  },
  {
    heading: "AI LEARNING",
    links: [
      { label: "AI Study Assistant", path: "/ai-assistant", icon: Sparkle },
      { label: "Summaries & Quizzes", path: "/summaries-quizzes", icon: List },
      { label: "Progress", path: "/progress", icon: ChartNoAxesColumn },
      { label: "Revision Planner", path: "/revision-planner", icon: Clock3 },
    ],
  },
];

const itemClass = ({ isActive }) =>
  `flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition-colors ${
    isActive
      ? "bg-[#eeebff] text-[#6555e8]"
      : "text-[#686d89] hover:bg-[#f7f6fc] hover:text-[#6555e8]"
  }`;

// isOpen/onClose control the drawer on small screens; on large screens it is always shown
export default function Sidebar({ isOpen = false, onClose }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Dark background behind the open drawer (small screens only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      )}

    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[240px] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Close button (small screens only) */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-5 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
        aria-label="Close menu"
      >
        <X size={20} />
      </button>

      {/* Logo */}
      <NavLink
        to="/dashboard"
        onClick={onClose}
        className="mb-6 flex items-center gap-3 px-2"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 text-white shadow-md shadow-violet-200/50">
          <Sparkles size={21} fill="white" strokeWidth={1.5} />
        </div>

        <div className="min-w-0">
          <h1 className="text-lg font-extrabold tracking-tight text-[#202238]">
            SmartLurn
          </h1>
          <p className="mt-0.5 text-[11px] text-[#8589a5]">
            Learn better, together
          </p>
        </div>
      </NavLink>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {navigation.map((section) => (
          <section key={section.heading} className="mb-4">
            <h2 className="mb-2 px-3 py-1 text-[10px] font-extrabold tracking-[1.2px] text-[#a0a4b8]">
              {section.heading}
            </h2>

            <nav className="flex flex-col gap-0.5">
              {section.links.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/dashboard"}
                  className={itemClass}
                  onClick={onClose}
                >
                  <Icon size={17} strokeWidth={2.3} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </section>
        ))}

        {/* Account */}
        <section className="mb-3">
          <h2 className="mb-2 px-3 py-1 text-[10px] font-extrabold tracking-[1.2px] text-[#a0a4b8]">
            ACCOUNT
          </h2>

          <nav className="flex flex-col gap-0.5">
            <NavLink to="/profile" className={itemClass} onClick={onClose}>
              <CircleUserRound size={17} strokeWidth={2.3} />
              <span>My Profile</span>
            </NavLink>

            <NavLink to="/settings" className={itemClass} onClick={onClose}>
              <Settings size={17} strokeWidth={2.3} />
              <span>Settings</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold text-[#686d89] transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={17} strokeWidth={2.3} />
              <span>Log out</span>
            </button>
          </nav>
        </section>
      </div>
    </aside>
    </>
  );
}
