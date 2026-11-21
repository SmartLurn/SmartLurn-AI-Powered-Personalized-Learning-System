import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, LoaderCircle } from "lucide-react";

const MAX_TITLE_LENGTH = 255; // same limit as the study_sessions.title column

function CreateMeetingModal({ isOpen, onClose, onCreate, isCreating = false }) {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Empty title is fine: the backend uses "Study Room"
    onCreate(title.trim());
  };

  const handleClose = () => {
    if (isCreating) return;
    setTitle("");
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-meeting-title"
        className="w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-xl animate-sheet-up sm:animate-pop-in sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="create-meeting-title"
              className="text-xl font-bold text-slate-800"
            >
              Create a Study Room
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Give your room a name so others know what you're studying.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close create room modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="meeting-title"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Room title
            </label>
            <input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DSA Revision"
              maxLength={MAX_TITLE_LENGTH}
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-pop-400 focus:ring-2 focus:ring-pop-100"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Leave empty to use "Study Room".
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-xl bg-cta px-5 py-3 text-sm font-medium text-on-cta hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}

export default CreateMeetingModal;
