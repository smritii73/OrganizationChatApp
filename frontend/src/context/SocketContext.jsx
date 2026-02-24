import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";
import { BASE_URL } from "../Url";
import useConversation from "../zustand/useConversation";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [contactRefreshTrigger, setContactRefreshTrigger] = useState(0);

  const { authUser } = useAuthContext();
  const { setTypingUsers } = useConversation();

  /* ===============================
     SOCKET CONNECTION
  =============================== */
  useEffect(() => {
    if (!authUser) return;

    const socketInstance = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🟢 Connected to socket server");
    });

    socketInstance.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socketInstance.on("contactAdded", () => {
      setContactRefreshTrigger((t) => t + 1);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [authUser]);

  /* ===============================
     TYPING EVENTS
  =============================== */
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (senderId) => {
      setTypingUsers(senderId, true);
    };

    const handleStopTyping = (senderId) => {
      setTypingUsers(senderId, false);
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, [socket, setTypingUsers]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        contactRefreshTrigger,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};