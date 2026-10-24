
import { useState, useCallback, useEffect, useRef } from "react";
import { socket } from "../config/socket";

export const useChat = (roomId, user) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Ref so the socket listener always sees the latest open/closed state
  const isChatOpenRef = useRef(false);

  // Messages from other people in the room
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);

      if (!isChatOpenRef.current) {
        setUnreadCount((count) => count + 1);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const trimmedText = text.trim();

      if (!trimmedText || !user) return;

      const message = {
        id: Date.now().toString(),
        roomId,
        text: trimmedText,
        senderId: user.id,
        senderName: user.name,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Show it straight away, then the server saves it and sends it to the others
      setMessages((prev) => [...prev, message]);
      socket.emit("send-message", { roomId, message });
    },
    [roomId, user]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      isChatOpenRef.current = !prev;

      if (!prev) {
        setUnreadCount(0);
      }

      return !prev;
    });
  }, []);

  return {
    messages,
    unreadCount,
    isChatOpen,
    sendMessage,
    toggleChat,
  };
};

export default useChat;
