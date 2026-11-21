import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Eye, EyeOff, KeyRound, LoaderCircle, LogOut, Monitor, Moon, Sun, Trash2 } from "lucide-react";
import api from "../config/api";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import PageHeader from "../components/PageHeader";

// Fixed colours so each preview always shows its own theme
const LIGHT_PREVIEW = { canvas: "bg-[#f4efe5]", side: "bg-[#fffcf6]", text: "bg-[#1f3d2b]", card: "bg-[#e8dcc4]" };
const DARK_PREVIEW = { canvas: "bg-[#0d1a12]", side: "bg-[#142319]", text: "bg-[#e8dcc4]", card: "bg-[#1f3d2b]" };

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun, preview: LIGHT_PREVIEW },
  { value: "dark", label: "Dark", icon: Moon, preview: DARK_PREVIEW },
  { value: "system", label: "Match device", icon: Monitor, preview: { canvas: "bg-gradient-to-r from-[#f4efe5] from-50% to-[#0d1a12] to-50%", side: "bg-[#fffcf6]", text: "bg-[#1f3d2b]", card: "bg-[#e8dcc4]" } },
];

const MIN_PASSWORD_LENGTH = 6; // same rule as the backend

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm text-slate-700 outline-none transition focus:border-pop-400 focus:ring-2 focus:ring-pop-100";

// Password input with a show/hide button
function PasswordInput({ id, label, value, onChange, autoComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { data } = await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      });

      toast.success(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setIsDeleting(true);

    try {
      // axios sends a body with DELETE through the "data" option
      await api.delete("/users/me", { data: { password: deletePassword } });

      toast.success("Your account has been deleted");
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete account");
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Settings" description="Manage your appearance, password and account." />

        {/* Appearance */}
        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-surface p-6" style={{ animationDelay: "60ms" }}>
          <h2 className="text-base font-semibold text-slate-900">Appearance</h2>
          <p className="mt-1 text-sm text-slate-500">Choose how SmartLurn looks on this device.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon, preview }) => {
              const isSelected = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={isSelected}
                  className={`press rounded-xl border p-3 text-left transition ${
                    isSelected ? "border-pop-400 ring-4 ring-pop-100" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Mini preview of the theme */}
                  <div className={`mb-3 flex h-16 overflow-hidden rounded-lg ${preview.canvas}`}>
                    <div className={`w-1/4 ${preview.side}`} />
                    <div className="flex flex-1 flex-col gap-1.5 p-2">
                      <div className={`h-2 w-3/5 rounded ${preview.text}`} />
                      <div className={`h-6 rounded ${preview.card}`} />
                      <div className="h-1.5 w-1/3 rounded bg-[#8b5cf6]" />
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Icon size={15} className={isSelected ? "text-pop-600" : "text-slate-400"} />
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Change password */}
        <section className="rounded-2xl border border-slate-200 bg-surface p-6">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-brand-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Change password
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Use at least {MIN_PASSWORD_LENGTH} characters.
          </p>

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <PasswordInput
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInput
                id="new-password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <PasswordInput
                id="confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-cta px-5 py-3 text-sm font-medium text-on-cta transition hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChangingPassword && <LoaderCircle size={16} className="animate-spin" />}
                {isChangingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </section>

        {/* Session */}
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Log out</h2>
            <p className="mt-1 text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-700">{user?.email || user?.name}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-red-200 bg-surface p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="text-base font-semibold text-red-700">Delete account</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            This permanently deletes your account, your uploaded materials, and the
            study rooms you hosted (including their chat history for everyone).
            This cannot be undone.
          </p>

          {!isDeleteOpen ? (
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete my account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4">
              <PasswordInput
                id="delete-password"
                label="Enter your password to confirm"
                value={deletePassword}
                onChange={setDeletePassword}
                autoComplete="current-password"
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setDeletePassword("");
                  }}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isDeleting || !deletePassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isDeleting ? "Deleting..." : "Permanently delete"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
