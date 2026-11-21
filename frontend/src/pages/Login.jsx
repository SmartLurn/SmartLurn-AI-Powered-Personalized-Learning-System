
import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";
import StudyIllustration from "../components/StudyIllustration";

const Login = ({ mode = "register" }) => {
  const isRegisterMode = mode === "register";

  const { login, signup, isAuthenticated, isAuthLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthLoading) {
    return <Loader text="Checking authentication..." fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await signup(name, email, password);
        toast.success("Account created successfully!");
      } else {
        await login(email, password);
        toast.success("Login successful!");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-leaf-500 px-4 py-10">
      {/* Decorative circles on the green background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-leaf-400/50" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-leaf-600/40" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-cream shadow-2xl shadow-leaf-900/30 md:grid-cols-2">
        {/* Left: welcome panel with illustration (medium screens and up) */}
        <div className="hidden flex-col justify-between gap-8 bg-peach p-10 md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-500 text-white">
              <Sparkles size={20} fill="white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-leaf-800">
              SmartLurn
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight text-leaf-800">
              Travel into the world of{" "}
              <span className="rounded-lg bg-brand-500 px-2 text-white">knowledge</span>
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Study together, ask your PDFs questions and keep track of your progress, all in one place.
            </p>
          </div>

          <StudyIllustration className="mx-auto w-full max-w-sm" />
        </div>

        {/* Right: form */}
        <div className="flex items-center p-6 sm:p-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isRegisterMode ? "Create your account" : "Welcome back"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRegisterMode
              ? "Sign up to get started with your account."
              : "Enter your details to sign in to your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegisterMode && (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 transition hover:text-brand-600"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : isRegisterMode
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          {isRegisterMode
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <Link
            to={isRegisterMode ? "/login" : "/register"}
            className="font-semibold text-brand-600 transition hover:text-brand-800"
          >
            {isRegisterMode ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
