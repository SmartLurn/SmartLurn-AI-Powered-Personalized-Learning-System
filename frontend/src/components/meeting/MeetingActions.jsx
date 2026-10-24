import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Keyboard, ArrowRight } from "lucide-react";
import api from "../../config/api";
import CreateMeetingModal from "./CreateMeetingModal";

// "Create Room" button + "Join" form, shared by the Dashboard and Sessions pages
function MeetingActions() {
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinId, setJoinId] = useState("");

  // Create a new meeting with the title from the modal
  // (the backend saves it and generates the code)
  const handleCreateMeeting = async (title) => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      const { data } = await api.post("/meetings", { title });

      toast.success("Meeting created successfully!");
      navigate(`/meeting/${data.meeting.meetingID}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not create meeting"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Join Meeting: check with the backend that it exists and hasn't ended
  const handleJoinMeeting = async (event) => {
    event.preventDefault();

    const cleanId = joinId.trim().toLowerCase();

    if (!cleanId) {
      toast.error("Please enter a valid meeting ID.");
      return;
    }

    try {
      await api.get(`/meetings/${encodeURIComponent(cleanId)}`);
      navigate(`/meeting/${encodeURIComponent(cleanId)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not join meeting");
    }
  };

  return (
    <>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {/* Create Room Button */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex w-auto items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700"
        >
          <Plus size={14} />
          Create Room
        </button>

        {/* Join Room Form (Input + Join Button) */}
        <form
          onSubmit={handleJoinMeeting}
          className="flex items-center gap-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
            <Keyboard
              size={15}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={joinId}
              onChange={(event) => setJoinId(event.target.value)}
              placeholder="Enter meeting ID"
              aria-label="Meeting ID"
              className="min-w-0 w-full bg-transparent py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-violet-700"
          >
            Join
            <ArrowRight size={13} />
          </button>
        </form>
      </div>

      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateMeeting}
        isCreating={isCreating}
      />
    </>
  );
}

export default MeetingActions;
