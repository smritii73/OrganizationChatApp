import { Server } from "socket.io";

let io;
const userSocketMap = {};
const activeCalls = new Map();

/* ===============================
   INIT SOCKET
=============================== */

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://chat-app-frontend-gules-chi.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log("User connected:", userId);

    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    /* ===============================
       CALL USER
    =============================== */

    socket.on("callUser", (data) => {
      const { userToCall, callType, caller, roomID } = data;

      const callId = `${caller._id}-${userToCall}-${Date.now()}`;

      activeCalls.set(callId, {
        callId,
        callerId: caller._id,
        receiverId: userToCall,
        callType,
        roomID,
        status: "calling",
      });

      const receiverSocketId = userSocketMap[userToCall];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incomingCall", {
          callId,
          caller,
          callType,
          roomID,
        });
      } else {
        socket.emit("callEnded", { reason: "User offline" });
      }
    });

    /* ===============================
       ACCEPT CALL
    =============================== */

    socket.on("acceptCall", ({ callerId, roomID }) => {
      const callerSocketId = userSocketMap[callerId];

      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", { roomID });
      }
    });

    /* ===============================
       REJECT CALL
    =============================== */

    socket.on("rejectCall", ({ callerId }) => {
      const callerSocketId = userSocketMap[callerId];

      if (callerSocketId) {
        io.to(callerSocketId).emit("callRejected");
      }
    });

    /* ===============================
       END CALL
    =============================== */

    socket.on("endCall", ({ userToCall }) => {
      const receiverSocketId = userSocketMap[userToCall];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callEnded");
      }
    });

    /* ===============================
       TYPING
    =============================== */

    socket.on("typing", ({ to }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", userId);
      }
    });

    socket.on("stopTyping", ({ to }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", userId);
      }
    });

    /* ===============================
       DISCONNECT
    =============================== */

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

/* ===============================
   HELPERS
=============================== */

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
