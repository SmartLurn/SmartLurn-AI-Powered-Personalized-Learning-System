import { useCallback, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";
import Logo from "../components/Logo";
import LoginIllustration from "../components/LoginIllustration";
import WelcomeSplash from "../components/WelcomeSplash";
import ThemeToggle from "../components/ThemeToggle";

const CURRENT_YEAR = new Date().getFullYear();

// Soft filled inputs with no border, like the reference design
const inputClass =
  "h-12 w-full rounded-xl bg-slate-100 px-4 text-sm text-slate-900 outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:bg-surface focus:ring-pop-400 focus:shadow-[0_0_0_4px_rgb(139_92_246_/_0.15)]";

// Decorative shapes on the indigo background
function BackgroundShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Dot grids */}
      <div
        className="absolute left-6 top-16 h-40 w-56 opacity-40"
        style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / 0.7) 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }}
      />
      <div
        className="absolute bottom-10 right-6 h-48 w-24 opacity-40"
        style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / 0.7) 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }}
      />
      {/* Purple glow */}
      <div className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-pop-500/25 blur-3xl" />
      {/* Circles */}
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/5" />
      <div className="absolute right-[18%] top-10 h-8 w-8 animate-float rounded-full bg-white/25" />
      <div className="absolute bottom-[12%] right-[8%] h-5 w-5 rounded-full bg-white/30" />
      {/* Triangles */}
      <div
        className="absolute left-[4%] top-6 h-0 w-0 animate-float border-y-[14px] border-l-[22px] border-y-transparent border-l-pop-400"
        style={{ animationDuration: "8s" }}
      />
      <div className="absolute bottom-[8%] left-[30%] h-0 w-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-pop-400/80" />
      {/* Slanted bars */}
      <div className="absolute left-0 top-[42%] h-6 w-24 -skew-y-12 bg-sand/25" />
      <div className="absolute right-0 top-[60%] h-6 w-20 -skew-y-12 bg-sand/25" />
    </div>
  );
}

const Login = ({ mode = "register" }) => {
  const isRegisterMode = mode === "register";

  const { login, signup, isAuthenticated, isAuthLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // After a successful login/sign-up: show the welcome screen, then go to the dashboard
  const [welcome, setWelcome] = useState(null); // { name, isNewUser }
  const [isSplashDone, setIsSplashDone] = useState(false);
  const finishSplash = useCallback(() => setIsSplashDone(true), []);

  if (welcome && !isSplashDone) {
    return <WelcomeSplash name={welcome.name} isNewUser={welcome.isNewUser} onDone={finishSplash} />;
  }

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
        const data = await signup(name, email, password);
        setWelcome({ name: data?.user?.name || name, isNewUser: true });
      } else {
        const data = await login(email, password);
        setWelcome({ name: data?.user?.name, isNewUser: false });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-4 sm:p-8">
      <BackgroundShapes />

      {/* Main card */}
      <div className="relative flex w-full max-w-6xl animate-pop-in flex-col rounded-[28px] bg-surface px-6 py-6 shadow-2xl shadow-black/30 sm:px-10 sm:py-8 lg:min-h-[640px] lg:px-14">
        {/* Top row: logo and switch button */}
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to={isRegisterMode ? "/login" : "/register"}
            className="press rounded-full border border-slate-300 px-5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-700"
          >
            {isRegisterMode ? "Log in" : "Register"}
          </Link>
          </div>
        </div>

        {/* Form and illustration */}
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-2 lg:py-6">
          <div className="mx-auto w-full max-w-sm animate-fade-up" style={{ animationDelay: "120ms" }}>
            <h1 className="text-xl font-semibold text-slate-900">
              {isRegisterMode ? "Create your account" : "Login to your account"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {isRegisterMode
                ? "Join your study group in a minute."
                : "Welcome back. Pick up where you left off."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {isRegisterMode && (
                <input
                  id="name"
                  type="text"
                  placeholder="Full name"
                  aria-label="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              )}

              <input
                id="email"
                type="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Your email"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className={inputClass}
              />

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegisterMode ? "Password (at least 6 characters)" : "Password"}
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3">
                {isRegisterMode ? (
                  <span className="text-xs text-slate-500">
                    Have an account?{" "}
                    <Link to="/login" className="font-medium text-brand-600 hover:text-brand-800">
                      Log in
                    </Link>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toast("Password reset is coming soon", { id: "forgot" })}
                    className="text-xs font-medium text-slate-500 transition hover:text-brand-700"
                  >
                    Forgot password?
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="press inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-full bg-pop-500 px-7 text-sm font-medium text-white shadow-lg shadow-pop-500/30 hover:bg-pop-600 focus:outline-none focus:ring-4 focus:ring-pop-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                  {isSubmitting ? "Please wait" : isRegisterMode ? "Sign up" : "Log in"}
                </button>
              </div>
            </form>
          </div>

          <LoginIllustration className="hidden w-full max-w-lg animate-fade-up justify-self-center lg:block" />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-slate-200/70 pt-5 text-xs text-slate-400">
          <span>© {CURRENT_YEAR} SmartLurn</span>
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-1.5 w-4 rounded-full bg-brand-600" />
            <span className="h-1.5 w-1.5 rounded-full bg-pop-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
