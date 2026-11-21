import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, CircleUserRound, LogOut, Settings } from "lucide-react";
import Avatar from "./Avatar";
import useAuth from "../hooks/useAuth";

// Avatar in the top bar: opens a small menu with profile, settings and log out
export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside the menu or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setIsOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-slate-50"
      >
        <Avatar name={user?.name} size={34} />
        <span className="hidden text-left md:block">
          <span className="block max-w-36 truncate text-sm font-medium text-slate-800">{user?.name || "Student"}</span>
          <span className="block max-w-36 truncate text-xs text-slate-500">{user?.email}</span>
        </span>
        <ChevronDown size={15} className={`hidden text-slate-400 transition-transform md:block ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right animate-pop-in rounded-xl border border-slate-200 bg-surface p-1.5 shadow-xl shadow-black/10"
        >
          {/* Who is signed in (shown here because phones hide it next to the avatar) */}
          <div className="border-b border-slate-100 px-3 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-medium text-slate-900">{user?.name || "Student"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="py-1">
            <Link to="/profile" role="menuitem" onClick={() => setIsOpen(false)} className={itemClass}>
              <CircleUserRound size={16} className="text-slate-400" />
              My profile
            </Link>
            <Link to="/settings" role="menuitem" onClick={() => setIsOpen(false)} className={itemClass}>
              <Settings size={16} className="text-slate-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
