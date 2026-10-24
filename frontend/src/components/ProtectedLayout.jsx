import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import SideBar from "./SideBar";
import Footer from "./Footer";

const ProtectedLayout = () => {
  // Sidebar drawer on small screens (always visible on large screens)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
      <SideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar with menu button, only on small screens */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-700 text-white">
              <Sparkles size={17} fill="white" strokeWidth={1.5} />
            </div>
            <span className="text-base font-extrabold tracking-tight text-[#202238]">
              SmartLurn
            </span>
          </div>
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
