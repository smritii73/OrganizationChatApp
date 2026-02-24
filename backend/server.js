import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import languageRoutes from "./routes/languageRoute.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js"; // ✅ ADDED

import connectToMongoDB from "./db/connectToMongoDB.js";
import { initSocket } from "./socket/socket.js";

/* LOAD ENV */

dotenv.config();
const app = express();
const server = http.createServer(app);
initSocket(server);

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

/* CORS */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://chat-app-frontend-gules-chi.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/* MIDDLEWARE */

app.use(express.json());
app.use(cookieParser());

/* ROUTES */

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/language", languageRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api", conversationRoutes); // ✅ ADDED - for /api/conversations

/* STATIC */

app.use(express.static(path.join(__dirname, "/Frontend/dist")));

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "dist", "index.html"));
});

/* START SERVER AFTER DB CONNECT */

const startServer = async () => {
  try {
    await connectToMongoDB();
    console.log("✅ Successfully Connected to Database");

    server.listen(PORT, () => {
      console.log(`✅ Server + Socket.IO running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

startServer();