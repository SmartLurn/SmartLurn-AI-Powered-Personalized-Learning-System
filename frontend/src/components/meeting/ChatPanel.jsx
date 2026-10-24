
import { useEffect, useRef, useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";

function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUser,
}) {
  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  // Scroll to the latest message when the chat opens
  // or a new message arrives.
  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!text.trim()) return;

    onSendMessage(text);
    setText("");
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-violet-600" />
          <h2 className="font-semibold text-slate-800">
            Study Chat
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle
              size={36}
              className="mb-3 text-slate-300"
            />
            <p className="font-medium text-slate-600">
              No messages yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Send a message to start chatting with participants.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.senderId === currentUser?.id;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium">
                    {isMe ? "You" : message.senderName}
                  </span>
                  <span>{message.time}</span>
                </div>

                <div
                  className={`max-w-[90%] break-words rounded-2xl px-3 py-2 text-sm ${
                    isMe
                      ? "rounded-br-sm bg-violet-600 text-white"
                      : "rounded-bl-sm bg-slate-100 text-slate-700"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            );
          })
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Send message form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-200 p-3"
      >
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
