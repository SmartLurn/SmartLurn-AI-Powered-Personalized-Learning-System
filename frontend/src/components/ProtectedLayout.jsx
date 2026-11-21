import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import SideBar from "./SideBar";
import Footer from "./Footer";
import Logo from "./Logo";
import Avatar from "./Avatar";
import useAuth from "../hooks/useAuth";

const ProtectedLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sidebar drawer on small screens (always visible on large screens)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Search looks through the user's study materials
  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/study-materials", { state: { search: search.trim() } });
    setSearch("");
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <Link to="/dashboard" className="lg:hidden">
            <Logo size="sm" />
          </Link>

          <form onSubmit={handleSearch} className="ml-auto hidden w-full max-w-sm sm:block lg:ml-0">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 transition focus-within:border-brand-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-50">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your materials..."
                className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                aria-label="Search your materials"
              />
            </label>
          </form>

          <Link
            to="/profile"
            className="ml-auto flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-slate-50 sm:ml-auto"
            title="My profile"
          >
            <Avatar name={user?.name} size={34} />
            <span className="hidden text-left md:block">
              <span className="block max-w-36 truncate text-sm font-medium text-slate-800">
                {user?.name || "Student"}
              </span>
              <span className="block max-w-36 truncate text-xs text-slate-500">{user?.email}</span>
            </span>
          </Link>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ProtectedLayout;
