
import { MessageCircle } from "lucide-react";

export default function SessionChatTranscript({ messages = [] }) {
  if (messages.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <MessageCircle size={26} />
        </div>

        <h3 className="font-semibold text-slate-800">
          No chat messages
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          There was no chat in this session. Messages exchanged during
          the meeting will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-80 space-y-4 overflow-y-auto p-1">
      {messages.map((message) => (
        <div
          key={message.id}
          className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
            {message.senderName?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {message.senderName || "Unknown participant"}
              </p>

              <time className="text-xs text-slate-400">
                {message.sentAt
                  ? new Date(message.sentAt).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""}
              </time>
            </div>

            <p className="mt-1 break-words text-sm leading-6 text-slate-600">
              {message.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
