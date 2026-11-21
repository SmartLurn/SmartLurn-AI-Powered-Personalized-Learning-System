import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Eye, EyeOff, FileText, MessagesSquare, UsersRound, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";
import Logo from "../components/Logo";

const features = [
  {
    icon: UsersRound,
    title: "Study rooms",
    text: "Video calls and live chat with up to 6 classmates.",
  },
  {
    icon: MessagesSquare,
    title: "Ask your notes",
    text: "Questions answered from your own PDFs, with page numbers.",
  },
  {
    icon: FileText,
    title: "One library",
    text: "All your study materials organised by subject.",
  },
];

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-50";

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
    <div className="flex min-h-screen bg-white">
      {/* Left: product panel (large screens) */}
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-brand-950 p-12 text-white lg:flex">
        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(rgb(255 255 255 / 0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative animate-fade-up">
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Study smarter, together.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-brand-100/80">
            Your notes, your study group and an assistant that knows your syllabus, in one place.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="flex animate-fade-up gap-4"
                style={{ animationDelay: `${150 + index * 90}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-sm text-brand-100/70">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-100/50">© {new Date().getFullYear()} SmartLurn</p>
      </aside>

      {/* Right: form */}
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {isRegisterMode ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {isRegisterMode
              ? "Start studying with your group in a minute."
              : "Sign in to continue your learning."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegisterMode ? "At least 6 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="press mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
              {isSubmitting ? "Please wait..." : isRegisterMode ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              to={isRegisterMode ? "/login" : "/register"}
              className="font-medium text-brand-600 transition hover:text-brand-800"
            >
              {isRegisterMode ? "Sign in" : "Create account"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
