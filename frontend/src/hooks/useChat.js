
import { useState, useCallback } from "react";

export const useChat = (roomId, user) => {
  const [messages, setMessages] = useState([
    {
        id: "chat_01",
        senderId: "user_mock_002",
        senderName: "Sarah Chen",
        text: "Hey Alex! Can you hear me clearly?",
        time: "02:15 PM",
    },
    {
        id: "chat_02",
        senderId: "user_mock_003",
        senderName: "Marcus Vance",
        text: "Loud and clear! Ready for the walkthrough.",
        time: "02:16 PM",
    },
]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sendMessage = useCallback(
    (text) => {
      const trimmedText = text.trim();

      if (!trimmedText || !user) return;

      const message = {
        id: Date.now().toString(),
        roomId,
        text: trimmedText,
        senderId: user.id,
        senderName: user.fullName || user.name,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [
        ...prev,
        message,
      ]);
    },
    [roomId, user]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      

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
