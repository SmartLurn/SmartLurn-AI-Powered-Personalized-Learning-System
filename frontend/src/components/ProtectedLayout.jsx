import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import Footer from "./Footer";

const ProtectedLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
      <SideBar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ProtectedLayout;