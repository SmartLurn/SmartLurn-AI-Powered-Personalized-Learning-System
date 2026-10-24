
import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sessions from "./pages/Sessions";
import Pricing from "./pages/Settings";
import MeetingRoom from "./pages/MeetingRoom";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";
import Revision from "./pages/Revision";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Summary from "./pages/Summary";
import Progress from "./pages/Progress";
import AIAssistant from "./pages/AIAssistant";
import Materials from "./pages/Materials";

// Temporary placeholder for pages we haven't built yet
const ComingSoon = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-slate-800">
      {title}
    </h1>
    <p className="mt-2 text-slate-500">
      This page will be implemented soon.
    </p>
  </div>
);

const App = () => {
  return (
    <>
      <Toaster />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={<Login mode="login" />}
        />
        <Route
          path="/register"
          element={<Login mode="register" />}
        />

        {/* Protected routes with shared layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/study-materials" element={<Materials/>}/>

            <Route path="/ai-assistant" element={<AIAssistant/>}/>

            <Route
              path="/summaries-quizzes"
              element={<Summary/>}
            />

            <Route
              path="/progress"
              element={<Progress/>}
            />

            <Route
              path="/revision-planner"
              element={<Revision/>}
            />

            <Route
              path="/profile"
              element={<Profile/>}
            />

            <Route
              path="/settings"
              element={<Settings/>}
            />

          </Route>

          {/* Meeting room uses its own layout */}
          <Route path="/meeting/:meetingId" element={<MeetingRoom />}/>
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </>
  );
};

export default App;
