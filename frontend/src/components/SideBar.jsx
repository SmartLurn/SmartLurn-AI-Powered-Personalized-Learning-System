import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  FileText,
  MessagesSquare,
  ClipboardList,
  ChartNoAxesColumn,
  CalendarClock,
  CircleUserRound,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import Logo from "./Logo";

const navigation = [
  {
    heading: "Workspace",
    links: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Study Rooms", path: "/sessions", icon: UsersRound },
      { label: "Study Materials", path: "/study-materials", icon: FileText },
      { label: "AI Study Assistant", path: "/ai-assistant", icon: MessagesSquare },
      { label: "Summaries & Quizzes", path: "/summaries-quizzes", icon: ClipboardList },
    ],
  },
  {
    heading: "Track",
    links: [
      { label: "Progress", path: "/progress", icon: ChartNoAxesColumn },
      { label: "Revision Planner", path: "/revision-planner", icon: CalendarClock },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "My Profile", path: "/profile", icon: CircleUserRound },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

const itemClass = ({ isActive }) =>
  `group relative flex min-h-[40px] items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all duration-200 ${
    isActive
      ? "bg-brand-50 text-brand-700"
      : "text-slate-500 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900"
  }`;

// isOpen/onClose control the drawer on small screens; on large screens it is always shown
export default function Sidebar({ isOpen = false, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Dark background behind the open drawer (small screens only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[244px] shrink-0 flex-col border-r border-slate-100 bg-surface px-3 py-5 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
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

        <NavLink to="/dashboard" onClick={onClose} className="mb-7 px-2">
          <Logo />
        </NavLink>

        <div className="flex-1 overflow-y-auto">
          {navigation.map((section) => (
            <section key={section.heading} className="mb-5">
              <h2 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
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
                    {({ isActive }) => (
                      <>
                        {/* Small bar on the left of the active page */}
                        <span
                          className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-pop-500 transition-opacity ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <Icon
                          size={17}
                          strokeWidth={2}
                          className={isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"}
                        />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </section>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="press flex min-h-[40px] items-center gap-3 rounded-xl px-3 text-left text-[13px] font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} strokeWidth={2} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
}
