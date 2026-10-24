import { io } from "socket.io-client";

// Socket.IO runs on the same server as the API
const SOCKET_URL = import.meta.env.VITE_BASE_URL;

// autoConnect is false so we only connect when the user enters a meeting room
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
