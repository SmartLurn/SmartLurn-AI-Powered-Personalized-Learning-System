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
          className="press flex h-10 w-auto items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} />
          New room
        </button>

        {/* Join Room Form (Input + Join Button) */}
        <form
          onSubmit={handleJoinMeeting}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-surface px-3 transition focus-within:border-pop-400 focus-within:ring-4 focus-within:ring-pop-100">
            <Keyboard
              size={15}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={joinId}
              onChange={(event) => setJoinId(event.target.value)}
              placeholder="Enter room code"
              aria-label="Room code"
              className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="press inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
