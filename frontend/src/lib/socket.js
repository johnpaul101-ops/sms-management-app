import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  if (!socket) {
    const socketURL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://sms-management-app.onrender.com";

    socket = io(socketURL, {
      query: { userId },
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
