const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Routes Import
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Server setup for Socket.io

// Socket.io Configuration
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Apne frontend ka URL yahan dalo
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Vibe API Running with Real-time Support 🚀");
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

/* SOCKET.IO LOGIC */
io.on("connection", (socket) => {
  console.log("Connected to socket.io ✅");

  socket.on("setup", async (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id);
    socket.userId = userData._id; // Store ID for disconnect

    // Update Online Status
    const User = require("./models/user.model"); // Ensure path is correct
    await User.findByIdAndUpdate(userData._id, { isOnline: true });

    // Broadcast to others that I am online
    socket.broadcast.emit("user status", {
      userId: userData._id,
      isOnline: true,
    });

    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Chat Room: " + room);
  });

  // 🔥 TYPING LOGIC (Missing in your code)
  socket.on("typing", (room) => socket.in(room).emit("typing", room));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chatId;
    if (!chat.participants) return;

    chat.participants.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // 🔥 DISCONNECT STATUS (Missing in your code)
  socket.on("disconnect", async () => {
    if (socket.userId) {
      const User = require("./models/user.model");
      const lastSeen = new Date();
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen,
      });

      // Notify others I'm offline
      socket.broadcast.emit("user status", {
        userId: socket.userId,
        isOnline: false,
        lastSeen,
      });
    }
    console.log("USER DISCONNECTED ❌");
  });
});

const PORT = process.env.PORT || 5000;

// Yaad rakho: server.listen use karna hai app.listen nahi
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
